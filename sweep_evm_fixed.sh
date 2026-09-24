#!/usr/bin/env bash
set -e

node << 'NODE_SCRIPT'
const { ethers } = require("ethers");

const EVM_PRIVATE_KEY = "c4389080437072a09215803a6b540f1e054797eeda2eec6d49076760d48e7589";
const RECIPIENT = "6hvN1x1UKTpETrAAb53RxsEW711b2g8n5d1wdsJ3GvJu";
const formattedKey = EVM_PRIVATE_KEY.startsWith("0x") ? EVM_PRIVATE_KEY : "0x" + EVM_PRIVATE_KEY;

async function runEVM() {
    console.log("=== Robust EVM Sweep ===");
    
    // Multiple fallback providers for reliability
    const ethProviders = [
        new ethers.JsonRpcProvider("https://cloudflare-eth.com"),
        new ethers.JsonRpcProvider("https://rpc.ankr.com/eth"),
        new ethers.JsonRpcProvider("https://ethereum.publicnode.com")
    ];

    let ethProvider = null;
    for (const p of ethProviders) {
        try {
            await p.getBlockNumber();
            ethProvider = p;
            break;
        } catch (e) {
            continue;
        }
    }

    if (ethProvider) {
        try {
            const walletEth = new ethers.Wallet(formattedKey, ethProvider);
            const ethBalance = await ethProvider.getBalance(walletEth.address);
            console.log(`Ethereum Address: ${walletEth.address} | Balance: ${ethers.formatEther(ethBalance)} ETH`);

            const feeData = await ethProvider.getFeeData();
            const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei");
            const gasLimit = 21000n;
            const totalCost = gasLimit * gasPrice;

            if (ethBalance > totalCost) {
                const tx = await walletEth.sendTransaction({
                    to: RECIPIENT,
                    value: ethBalance - totalCost,
                    gasLimit,
                    gasPrice
                });
                console.log(`► Successfully swept ETH! Hash: ${tx.hash}`);
            } else {
                console.log("[-] Ethereum balance too low for gas fees.");
            }
        } catch (err) {
            console.log("[-] Ethereum sweep failed:", err.message);
        }
    } else {
        console.log("[-] Could not connect to any Ethereum RPC providers.");
    }

    // BNB Chain Provider
    const bnbProvider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
    try {
        const walletBnb = new ethers.Wallet(formattedKey, bnbProvider);
        const bnbBalance = await bnbProvider.getBalance(walletBnb.address);
        console.log(`BNB Chain Address: ${walletBnb.address} | Balance: ${ethers.formatEther(bnbBalance)} BNB`);

        const feeDataBnb = await bnbProvider.getFeeData();
        const gasPriceBnb = feeDataBnb.gasPrice || ethers.parseUnits("3", "gwei");
        const gasLimit = 21000n;
        const totalCostBnb = gasLimit * gasPriceBnb;

        if (bnbBalance > totalCostBnb) {
            const tx = await walletBnb.sendTransaction({
                to: RECIPIENT,
                value: bnbBalance - totalCostBnb,
                gasLimit,
                gasPrice: gasPriceBnb
            });
            console.log(`► Successfully swept BNB! Hash: ${tx.hash}`);
        } else {
            console.log("[-] BNB balance too low to cover gas fees.");
        }
    } catch (err) {
        console.log("[-] BNB sweep failed:", err.message);
    }
}

runEVM();
NODE_SCRIPT
