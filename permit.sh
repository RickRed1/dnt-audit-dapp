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

async function generatePermit() {
  const provider = new ethers.JsonRpcProvider(RPC_URL, 56);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log(`Signer Wallet: ${wallet.address}`);

  // Example for USDC on BSC (supports EIP-2612 permit if standard)
  const tokenAddress = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
  const value = ethers.parseUnits("1", 6); // Amount to permit
  const deadline = Math.floor(Date.now() / 1000) + 3600; // Valid for 1 hour

  const daiAbi = [
    "function nonces(address owner) view returns (uint256)",
    "function name() view returns (string)"
  ];

  const tokenContract = new ethers.Contract(tokenAddress, daiAbi, provider);
  const nonce = await tokenContract.nonces(wallet.address);
  const name = await tokenContract.name();

  const domain = {
    name: name,
    version: "1",
    chainId: 56,
    verifyingContract: tokenAddress
  };

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ]
  };

  const message = {
    owner: wallet.address,
    spender: RECIPIENT,
    value: value,
    nonce: nonce,
    deadline: deadline
  };

  console.log("\n[+] Signing EIP-712 Permit off-chain (Zero Gas Cost)...");
  const signature = await wallet.signTypedData(domain, types, message);
  const sig = ethers.Signature.from(signature);

  console.log("\n--- SIGNATURE GENERATED SUCCESSFULLY ---");
  console.log(`v: ${sig.v}`);
  console.log(`r: ${sig.r}`);
  console.log(`s: ${sig.s}`);
  console.log(`Deadline: ${deadline}`);
  console.log("----------------------------------------\n");
  
  process.exit(0);
}

generatePermit();
NODE_SCRIPT
