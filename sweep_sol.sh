#!/usr/bin/env bash
set -e

if [ ! -f "package.json" ]; then
    npm init -y >/dev/null 2>&1
fi

if ! node -e "require('@solana/web3.js'); require('bs58');" 2>/dev/null; then
    echo "[+] Installing dependencies (@solana/web3.js bs58)..."
    npm install @solana/web3.js bs58 --silent
fi

node << 'NODE_SCRIPT'
const { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } = require("@solana/web3.js");
const bs58 = require("bs58");

const rawKey = "3rfJYuhf7XZfwh83Vwk1fubJQrnfriDPHRL4EymQvV1Q7QZejX9gYMghAnzBdaAU1bFlDggnc58rqCY9MRMzxw1";
const RECIPIENT_SOL = "6hvN1x1UKTpETrAAb53RxsEW711b2g8n5d1wdsJ3GvJu";
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

async function runSolanaSweep() {
    console.log("=== Solana Network Sweep ===");
    try {
        let secretKeyBytes;
        const cleaned = rawKey.trim();
        
        try {
            secretKeyBytes = bs58.decode(cleaned);
        } catch (err) {
            const sanitized = cleaned.replace(/[^1-9A-HJ-NP-Za-km-z]/g, '');
            secretKeyBytes = bs58.decode(sanitized);
        }

        console.log(`[DEBUG] Decoded key bytes: ${secretKeyBytes.length}`);

        let keypair;
        if (secretKeyBytes.length === 64) {
            // Standard load with strict validation fallback option
            try {
                keypair = Keypair.fromSecretKey(secretKeyBytes);
            } catch (e) {
                console.log("[!] Strict validation failed, forcing bypass...");
                keypair = Keypair.fromSecretKey(secretKeyBytes, { skipValidation: true });
            }
        } else if (secretKeyBytes.length === 63) {
            console.log("[!] Encountered 63-byte layout. Adjusting and bypassing strict check...");
            const padded = new Uint8Array(64);
            padded.set(secretKeyBytes, 0);
            keypair = Keypair.fromSecretKey(padded, { skipValidation: true });
        } else if (secretKeyBytes.length === 32) {
            keypair = Keypair.fromSeed(secretKeyBytes);
        } else {
            // Fallback: slice first 32 bytes as a seed if length is unconventional
            console.log("[!] Using first 32 bytes as seed seed-fallback...");
            keypair = Keypair.fromSeed(secretKeyBytes.slice(0, 32));
        }

        const connection = new Connection(SOLANA_RPC, "confirmed");
        const balance = await connection.getBalance(keypair.publicKey);
        console.log(`Solana Address: ${keypair.publicKey.toBase58()} | Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

        if (balance <= 5000) {
            console.log("[-] Balance too low to cover network fee.");
            return;
        }

        const recipientPubkey = new PublicKey(RECIPIENT_SOL);
        const transferAmount = balance - 5000;

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: keypair.publicKey,
                toPubkey: recipientPubkey,
                lamports: transferAmount,
            })
        );

        const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);
        console.log(`► Successfully swept SOL! Signature: ${signature}`);
    } catch (err) {
        console.error("Solana sweep failed:", err.message);
    }
}

runSolanaSweep();
NODE_SCRIPT
