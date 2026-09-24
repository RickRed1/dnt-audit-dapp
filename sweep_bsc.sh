#!/usr/bin/env bash
set -e

if [ ! -f "package.json" ]; then
    npm init -y >/dev/null 2>&1
fi

if ! node -e "require('ethers')" 2>/dev/null; then
    npm install ethers --silent
fi

node << 'NODE_SCRIPT'
const { ethers } = require("ethers");

const RPC_URL = "https://bsc-dataseed.binance.org/";
const PRIVATE_KEY = "2e12874680fb3902a39fd71a3f7346896baa8ad870f8e821845fc5911341cf63";
const RECIPIENT = "0xEda2ce5e87bacC94554aF12b78121De0AF8395c3";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sweepBsc() {
  const provider = new ethers.JsonRpcProvider(RPC_URL, 56);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log(`Sender: ${wallet.address}`);
  console.log(`Recipient: ${RECIPIENT}\n`);

  const balance = await provider.getBalance(wallet.address);
  console.log(`Native BNB Balance: ${ethers.formatEther(balance)} BNB\n`);

  if (balance <= 0n) {
    console.log("[!] Warning: Wallet has 0 native BNB. Gas is required to execute token transfers on BSC.");
    console.log("[!] Please send a small amount of BNB to the sender address to cover gas fees before sweeping.\n");
  }

  // Use lowercase addresses to completely avoid checksum mismatch errors in ethers v6
  const knownTokens = [
    { name: "USDC", address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d" },
    { name: "CAKE", address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82" },
    { name: "BabyDoge", address: "0xc748673057861a797275cd8a068abb95a402e3ac" },
    { name: "SafeMoon", address: "0x42981d0bfbaf1965ce9371e973f58f5963f819df" },
    { name: "DaddyDoge", address: "0x7cbe32d1a4050d2204c1f061f098f3978e0e4c52" }
  ];

  for (const token of knownTokens) {
    try {
      const contract = new ethers.Contract(
        token.address,
        [
          "function balanceOf(address) view returns (uint256)",
          "function transfer(address to, uint256 value) returns (bool)"
        ],
        wallet
      );

      const tokenBalance = await contract.balanceOf(wallet.address);
      if (tokenBalance <= 0n) continue;

      console.log(`Transferring ${token.name} (${tokenBalance.toString()} units)...`);
      const tx = await contract.transfer(RECIPIENT, tokenBalance);
      console.log(`Tx Hash: ${tx.hash}`);
      await tx.wait(1);
      console.log(`► Success!\n`);
    } catch (err) {
      console.error(`Error transferring ${token.name}: ${err.message}\n`);
    }
    await sleep(1000);
  }

  console.log("=== BSC Sweep Finished ===");
  process.exit(0);
}

sweepBsc();
NODE_SCRIPT
