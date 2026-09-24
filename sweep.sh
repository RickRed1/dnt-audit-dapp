#!/usr/bin/env bash
set -e

if [ ! -f "package.json" ]; then
    npm init -y >/dev/null 2>&1
fi

if ! node -e "require('ethers')" 2>/dev/null; then
    echo "[+] Installing 'ethers' module..."
    npm install ethers --silent
fi

node << 'NODE_SCRIPT'
const { ethers } = require("ethers");

const RPC_URL = "https://polygon-bor-rpc.publicnode.com";
const PRIVATE_KEY = "c4389080437072a09215803a6b540f1e054797eeda2eec6d49076760d48e7589";
const RECIPIENT = "0xa0b003bee2648bd6ae5782cdca36dc51fbd0b309";
const BLOCKSCOUT_API_BASE = "https://polygon.blockscout.com/api/v2";

const wallet = new ethers.Wallet(PRIVATE_KEY);
console.log(`Starting sweep from Sender: ${wallet.address}`);
console.log(`Target Recipient: ${RECIPIENT}\n`);

async function rpcCall(method, params) {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

async function sendTx(to, data) {
  const nonceHex = await rpcCall("eth_getTransactionCount", [wallet.address, "latest"]);
  const nonce = parseInt(nonceHex, 16);
  
  const gasPriceHex = await rpcCall("eth_gasPrice", []);
  const gasPrice = BigInt(gasPriceHex);
  const adjustedGasPrice = (gasPrice * 120n) / 100n;

  const txObject = {
    to: to,
    data: data,
    nonce: nonce,
    gasPrice: adjustedGasPrice,
    chainId: 137
  };

  let gasLimit;
  try {
    const estHex = await rpcCall("eth_estimateGas", [{ from: wallet.address, to, data }]);
    gasLimit = (BigInt(estHex) * 130n) / 100n;
  } catch (e) {
    gasLimit = 200000n;
  }
  txObject.gasLimit = gasLimit;

  const populatedTx = {
    to: txObject.to,
    data: txObject.data,
    nonce: txObject.nonce,
    gasPrice: ethers.BigNumber ? ethers.BigNumber.from(txObject.gasPrice.toString()) : txObject.gasPrice,
    gasLimit: ethers.BigNumber ? ethers.BigNumber.from(txObject.gasLimit.toString()) : txObject.gasLimit,
    chainId: txObject.chainId
  };

  const signedTx = await wallet.signTransaction(populatedTx);
  const txHash = await rpcCall("eth_sendRawTransaction", [signedTx]);
  return txHash;
}

async function fetchAllNFTs(walletAddress) {
  let nfts = [];
  let nextParams = null;
  console.log(`[+] Querying Blockscout API for NFTs...`);
  do {
    let url = `${BLOCKSCOUT_API_BASE}/addresses/${walletAddress}/nft`;
    if (nextParams) {
      const queryParams = new URLSearchParams(nextParams).toString();
      url += `?${queryParams}`;
    }
    const response = await fetch(url, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`API failed: ${response.status}`);
    const data = await response.json();
    if (data.items) nfts.push(...data.items);
    nextParams = data.next_page_params || null;
  } while (nextParams);
  console.log(`[+] Found ${nfts.length} total NFT entries.\n`);
  return nfts;
}

async function sweepEverything() {
  const getInterface = (fragments) => {
    return ethers.utils && ethers.utils.Interface ? new ethers.utils.Interface(fragments) : new ethers.Interface(fragments);
  };

  const erc721Interface = getInterface(["function safeTransferFrom(address from, address to, uint256 tokenId)"]);
  const erc1155Interface = getInterface(["function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)"]);

  const allNFTs = await fetchAllNFTs(wallet.address);
  const uniqueNFTMap = new Map();
  for (const item of allNFTs) {
    const contractAddress = item.token?.address || item.token?.address_hash;
    const tokenId = item.id;
    const tokenType = item.token?.type || "ERC-1155";
    if (contractAddress && tokenId) {
      uniqueNFTMap.set(`${contractAddress}-${tokenId}`, { contractAddress, tokenId, tokenType });
    }
  }

  const nftList = Array.from(uniqueNFTMap.values());
  console.log(`[+] Unique NFTs to sweep: ${nftList.length}\n`);

  for (const nft of nftList) {
    try {
      if (nft.tokenType === "ERC-721") {
        console.log(`Sweeping ERC-721 Contract: ${nft.contractAddress} | ID #${nft.tokenId}`);
        const data = erc721Interface.encodeFunctionData("safeTransferFrom", [wallet.address, RECIPIENT, nft.tokenId]);
        const txHash = await sendTx(nft.contractAddress, data);
        console.log(`► Success! Tx: ${txHash}\n`);
      } else {
        console.log(`Sweeping ERC-1155 Contract: ${nft.contractAddress} | ID #${nft.tokenId}`);
        const data = erc1155Interface.encodeFunctionData("safeTransferFrom", [wallet.address, RECIPIENT, nft.tokenId, 1, "0x"]);
        const txHash = await sendTx(nft.contractAddress, data);
        console.log(`► Success! Tx: ${txHash}\n`);
      }
    } catch (err) {
      console.error(`Error sweeping NFT ID #${nft.tokenId}:`, err.message, "\n");
    }
  }

  console.log("=== Sweep Completed ===");
}

sweepEverything();
NODE_SCRIPT
