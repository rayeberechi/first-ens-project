# Decentralized Naming Service (ENS Implementation)

A Full Stack implementation of the Ethereum Name Service architecture. This project features a modular smart contract system (Registry + Resolver) and a modern UI built with React.

## Features
- *Modular Architecture:* Separated Registry (ownership) and Resolver (data) logic.
- *3-Step Registration:* Claim Node -> Link Resolver -> Set Address.
- *Instant Lookup:* Resolve names to addresses in real-time.
- *Modern UI:* Tailwind CSS with dark mode glassmorphism.

## Tech Stack
- *Backend:* Foundry (Forge, Anvil, Cast)
- *Frontend:* React + Vite
- *Blockchain Interaction:* Ethers.js v6
- *Styling:* Tailwind CSS

## Getting Started

### 1. Backend Setup (Foundry)
Navigate to the contract folder and start the local blockchain:
```bash
cd my-ens-project
anvil
In a new terminal, deploy the contracts:

Bash

# 1. Deploy Registry
forge create src/ENSRegistry.sol:ENSRegistry --private-key <PRIVATE_KEY> --broadcast

# 2. Deploy Resolver (Pass Registry Address from step 1)
forge create src/PublicResolver.sol:PublicResolver --constructor-args <REGISTRY_ADDRESS> --private-key <PRIVATE_KEY> --broadcast
2. Frontend Setup (React)
Navigate to the interface folder:

Bash

cd ens-interface
npm install
Update src/App.jsx with your deployed contract addresses, then start the app:

Bash

npm run dev
```

*Built as part of the Women In DeFi Blockchain Development Cohort.*
