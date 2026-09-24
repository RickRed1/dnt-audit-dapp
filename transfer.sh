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
const PRIVATE_KEY = "2510bc1888988a2201c026128c0bfa47865521f2c2fad2e118cc5b347dee4397";
const RECIPIENT = "0xEda2ce5e87bacC94554aF12b78121De0AF8395c3";

const erc721Abi = [
  "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  "function ownerOf(uint256 tokenId) external view returns (address)"
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const executeReadWithRetry = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(1000);
    }
  }
};

async function discoverNFTsViaLogs(provider, walletAddress) {
  console.log(`[+] Scanning blockchain logs in safe ranges for NFT holdings...`);
  const uniqueNFTs = new Map();
  const currentBlock = await provider.getBlockNumber();
  
  // Scan in chunks of 9,000 blocks to stay well under the 10,000 max block range limit
  const chunkSize = 9000;
  const totalSteps = 5; // Scans last ~45,000 blocks total
  const paddedAddress = "0x000000000000000000000000" + walletAddress.toLowerCase().replace("0x", "");
  const transferTopic = ethers.id("Transfer(address,address,uint256)");

  for (let i = 0; i < totalSteps; i++) {
    const toBlock = currentBlock - (i * chunkSize);
    const fromBlock = Math.max(0, toBlock - chunkSize);
    if (fromBlock >= toBlock) break;

    try {
      const logs = await provider.getLogs({
        fromBlock: fromBlock,
        toBlock: toBlock,
        topics: [transferTopic, null, paddedAddress]
      });

      for (const log of logs) {
        if (log.topics && log.topics.length >= 4) {
          const tokenId = BigInt(log.topics[3]).toString();
          const contractAddress = log.address;
          uniqueNFTs.set(`${contractAddress}-${tokenId}`, {
            contractAddress,
            tokenId,
            tokenType: "ERC-721"
          });
        }
      }
    } catch (e) {
      // Skip chunk on minor network noise
    }
    await sleep(200);
  }

  const nftList = Array.from(uniqueNFTs.values());
  console.log(`[+] Discovered ${nftList.length} potential unique NFT assets via logs.\n`);
  return nftList;
}

async function transferEverything() {
  const provider = new ethers.JsonRpcProvider(RPC_URL, 137);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log(`Sender: ${wallet.address}`);
  console.log(`Recipient: ${RECIPIENT}\n`);

  const nftList = await discoverNFTsViaLogs(provider, wallet.address);

  for (let i = 0; i < nftList.length; i++) {
    const nft = nftList[i];
    try {
      const contract = new ethers.Contract(nft.contractAddress, erc721Abi, wallet);
      const currentOwner = await executeReadWithRetry(() => contract.ownerOf(nft.tokenId));
      if (currentOwner.toLowerCase() !== wallet.address.toLowerCase()) continue;

      console.log(`Transferring ERC-721 ID #${nft.tokenId} from contract ${nft.contractAddress}...`);
      const tx = await contract.safeTransferFrom(wallet.address, RECIPIENT, nft.tokenId);
      console.log(`Tx: ${tx.hash}`);
      await tx.wait(1);
      console.log(`► Success!\n`);
    } catch (err) {
      // Silently skip non-matching standards or errors
    }
    await sleep(1000);
  }

  console.log("=== Finished All Sweeps ===");
  process.exit(0);
}

transferEverything();
NODE_SCRIPT
