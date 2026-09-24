const { ethers } = require("ethers");

// Replace with your actual PUBLIC wallet address (42 characters starting with 0x)
const TARGET_WALLETS = [
  "0xYourActualPublicWalletAddressHere"
];

// Open public RPC endpoints that do not require an API key
const RPCS = [
  "https://polygon-bor-rpc.publicnode.com",
  "https://1rpc.io/matic",
  "https://polygon.drpc.org"
];

const POPULAR_TOKENS = [
  { symbol: "USDT", contract: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", decimals: 6 },
  { symbol: "USDC", contract: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", decimals: 6 },
  { symbol: "WETH", contract: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", decimals: 18 }
];

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)"
];

async function getWorkingProvider() {
  for (const url of RPCS) {
    try {
      const provider = new ethers.JsonRpcProvider(url);
      await provider.getBlockNumber();
      console.log(`[+] Connected successfully to RPC: ${url}\n`);
      return provider;
    } catch (err) {
      continue;
    }
  }
  throw new Error("All public RPC endpoints failed to connect.");
}

async function runLiveAudit() {
  console.log("=== Comprehensive Wallet Inventory Audit ===");
  
  let provider;
  try {
    provider = await getWorkingProvider();
  } catch (err) {
    console.log(`[!] ${err.message}`);
    return;
  }

  for (const wallet of TARGET_WALLETS) {
    if (!ethers.isAddress(wallet)) {
      console.log(`[!] Invalid public address format: ${wallet}`);
      console.log(`    Make sure to use your 42-character public address, not a private key.`);
      continue;
    }

    console.log(`------------------------------------------`);
    console.log(`Auditing Wallet: ${wallet}`);
    console.log(`------------------------------------------`);

    try {
      const nativeBalance = await provider.getBalance(wallet);
      console.log(`[+] Native Balance: ${ethers.formatEther(nativeBalance)} MATIC/POL`);
    } catch (err) {
      console.log(`[!] Error fetching native balance: ${err.message}`);
    }

    console.log(`--- Scanning Common Tokens ---`);
    for (const token of POPULAR_TOKENS) {
      try {
        const contract = new ethers.Contract(token.contract, ERC20_ABI, provider);
        const balance = await contract.balanceOf(wallet);
        if (balance > 0n) {
          const formatted = ethers.formatUnits(balance, token.decimals);
          console.log(`[+] Found ${formatted} ${token.symbol}`);
        }
      } catch (err) {
        // Skip failed lookups
      }
    }
  }
}

runLiveAudit();
