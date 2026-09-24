# Decentralized Notary & Tax Auditing Protocol (`dnt-audit-dapp`)

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)

The **Decentralized Notary & Tax Auditing Protocol** provides an immutable, transparent, and non-custodial Web3 framework for document hashing, compliance record-keeping, and zero-allowance fee distribution.

---

## Architecture Overview

```text
dnt-audit-dapp/
├── contracts/                  # EVM Smart Contracts (Hardhat / Foundry)
│   ├── contracts/
│   │   └── AuditRegistry.sol   # Notarization & Merkle claim engine
│   └── scripts/
│       ├── deploy.js           # Network deployment pipeline
│       └── generateMerkle.js   # Off-chain proof generation
├── frontend/                   # React SPA Frontend (Vite + Wagmi)
│   ├── src/
│   │   ├── components/         # UI Components (Notary & Claim panels)
│   │   └── config/             # Wagmi & RPC configuration
│   └── vite.config.js          # Base path setup for GitHub Pages
└── .github/workflows/
    └── deploy.yml              # GitHub Actions CI/CD Pages deployment
