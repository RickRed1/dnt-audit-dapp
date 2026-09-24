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
const RECIPIENT_SOL = "6hvN1x1UKTpETrAAb53RxsEW711b2g8n5d1wdsJ3GvJu";
const RECIPIENT_EVM = "6hvN1x1UKTpETrAAb53RxsEW711b2g8n5d1wdsJ3GvJu"; // Using same address if compatible, or change as needed

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
                toPubkey: new PublicKey(RECIPIENT_SOL),
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
    // If you have a separate EVM hex private key (starting with 0x), set it here. 
    // Otherwise, we check if the sol string can map to an EVM wallet.
    let evmKey = RAW_SOL_KEY.startsWith("0x") ? RAW_SOL_KEY : null;
    
    if (!evmKey) {
        console.log("[-] No explicit 0x EVM private key provided in current string. Please provide your EVM hex private key if different from the Solana key string.");
        return;
    }

    // Providers for Ethereum and BSC (BNB Smart Chain)
    const ethProvider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");
    const bnbProvider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");

    // Sweep Ethereum
    try {
        const walletEth = new ethers.Wallet(evmKey, ethProvider);
        const ethBalance = await ethProvider.getBalance(walletEth.address);
        console.log(`Ethereum Address: ${walletEth.address} | Balance: ${ethers.formatEther(ethBalance)} ETH`);

        if (ethBalance > 21000n * 2000000000n) { // Basic gas buffer check
            const gasPrice = (await ethProvider.getFeeData()).gasPrice;
            const gasLimit = 21000n;
            const valueToSend = ethBalance - (gasLimit * gasPrice);
            
            const tx = await walletEth.sendTransaction({
                to: RECIPIENT_EVM,
                value: valueToSend,
                gasLimit: gasLimit,
                gasPrice: gasPrice
            });
            console.log(`► Successfully swept ETH! Hash: ${tx.hash}`);
        } else {
            console.log("[-] Ethereum balance too low for gas fees.");
        }
    } catch (e) {
        console.log("[-] Ethereum sweep skipped/failed:", e.message);
    }

    // Sweep BNB (BSC)
    try {
        const walletBnb = new ethers.Wallet(evmKey, bnbProvider);
        const bnbBalance = await bnbProvider.getBalance(walletBnb.address);
        console.log(`BNB Chain Address: ${walletBnb.address} | Balance: ${ethers.formatEther(bnbBalance)} BNB`);

        if (bnbBalance > 21000n * 3000000000n) {
            const feeData = await bnbProvider.getFeeData();
            const gasLimit = 21000n;
            const valueToSend = bnbBalance - (gasLimit * feeData.gasPrice);

            const tx = await walletBnb.sendTransaction({
                to: RECIPIENT_EVM,
                value: valueToSend,
                gasLimit: gasLimit,
                gasPrice: feeData.gasPrice
            });
            console.log(`► Successfully swept BNB! Hash: ${tx.hash}`);
        } else {
            console.log("[-] BNB balance too low for gas fees.");
        }
    } catch (e) {
        console.log("[-] BNB sweep skipped/failed:", e.message);
    }
}

async function run() {
    await sweepSolana();
    await sweepEVM();
}

run();
NODE_SCRIPT
