# ServiceLog — BOT Chain dApp

A professional, decentralized service ledger built on the **BOT Chain** ecosystem. ServiceLog empowers service providers, contractors, and enterprises to record cryptographically verifiable service milestones on-chain, while granting customers and public auditors immutable proof of delivered services.

---

## 🌟 Key Features

1. **Decentralized Milestone Logging:**
   - Providers generate unique 32-byte (`bytes32`) service records tied to customer wallet addresses.
   - Long descriptions and personal details stay off-chain for user privacy and gas optimization.
2. **Strict Cryptographic Access Control:**
   - Only the originating service provider can mark a pending record as **Completed** or **Cancelled**.
   - Terminal state locks: Completed records cannot be cancelled; Cancelled records cannot be revived or marked complete.
   - Duplicate service IDs, invalid/zero customer addresses, and self-referential assignments are strictly rejected on-chain.
3. **Public On-Chain Verification:**
   - Anyone can inspect a Service ID to view verifiable state directly from the smart contract without needing a wallet.
   - Direct integration with the **BOT Chain Explorer** (`https://scan.bohr.life/`).
4. **Reown AppKit + Wagmi v2 + Viem:**
   - Integrated with `@reown/appkit` (Web3Modal) and `wagmi@2.x` for multi-wallet connectivity.
   - Configured with official BOT Chain network specifications.

---

## 🌐 BOT Chain Network Parameters

| Parameter | BOT Chain Testnet | BOT Chain Mainnet |
| :--- | :--- | :--- |
| **Network Name** | BOT Chain Testnet | BOT Chain |
| **Chain ID** | `968` (`0x3c8`) | `677` (`0x2a5`) |
| **RPC Endpoint** | `https://rpc.bohr.life` | `https://rpc.botchain.ai` |
| **Block Explorer** | [https://scan.bohr.life](https://scan.bohr.life) | [https://scan.botchain.ai](https://scan.botchain.ai) |
| **Native Currency** | `BOT` (18 decimals) | `BOT` (18 decimals) |
| **Total Supply** | 150 Million BOT | — |

---

## 📁 Repository Structure

```
serviceLog/
├── contracts/
│   └── ServiceLog.sol         # Solidity smart contract with storage packing & custom errors
├── scripts/
│   └── deploy.cjs             # Hardhat deployment script to BOT Chain Testnet/Mainnet
├── test/
│   └── ServiceLog.test.cjs    # Comprehensive Chai/Hardhat unit tests (security & transitions)
├── src/
│   ├── components/            # UI components (Navbar, Footer, StatusBadge, TransactionModal)
│   ├── config/                # Viem custom chain definitions & Reown AppKit setup
│   ├── contracts/             # Contract ABI and address configuration
│   ├── hooks/                 # Web3 & smart contract interaction hook (useServiceContract)
│   ├── pages/                 # 5 Core pages: Dashboard, Create, Provider, Customer, Verify
│   ├── types/                 # TypeScript interfaces and ServiceStatus enum
│   ├── utils/                 # Formatters, serviceId generator & validators
│   ├── App.tsx                # Main application component & tab router
│   └── main.tsx               # WagmiProvider + QueryClientProvider root
├── hardhat.config.cjs         # Hardhat configuration for BOT Chain networks
├── package.json
└── README.md
```

---

## 🔒 Smart Contract Architecture (`ServiceLog.sol`)

### State Transitions
```
                ┌────────────────┐
                │  createService │
                └───────┬────────┘
                        │
                        ▼
                ┌────────────────┐
     ┌──────────┤    Pending     ├──────────┐
     │          └────────────────┘          │
     │ completeService           cancelService
     ▼                                      ▼
┌───────────┐                         ┌───────────┐
│ Completed │ (Terminal)              │ Cancelled │ (Terminal)
└───────────┘                         └───────────┘
```

### Core Interface
- `createService(bytes32 serviceId, address customer, string title, string description)`: Registers a new record.
- `completeService(bytes32 serviceId)`: Finalizes a pending record (provider only).
- `cancelService(bytes32 serviceId)`: Cancels a pending record (provider only).
- `getService(bytes32 serviceId)`: Returns the complete record tuple.
- `getMyServices()`: Lists all service IDs initiated by the caller.
- `getCustomerServices(address customer)`: Lists all service IDs where `customer` is the recipient.
- `getAllServiceIds(uint256 offset, uint256 limit)`: Paginated global service index.

---

## 🧪 Running Unit Tests

Smart contract unit tests verify all security boundaries, unauthorized calls, zero address checks, and valid/invalid state transitions:

```bash
# Run tests with Hardhat
npm run test
```

### Verified Test Cases:
- Service record creation & event emission (`ServiceCreated`).
- Rejection of duplicate service IDs (`ServiceAlreadyExists`).
- Rejection of `address(0)` and caller as customer (`InvalidCustomerAddress`, `CustomerCannotBeProvider`).
- Rejection of empty title strings (`EmptyTitle`).
- Provider authorization verification on `completeService` and `cancelService` (`UnauthorizedCaller`).
- Protection against invalid state transitions:
  - Completed $\rightarrow$ Cancelled (reverts)
  - Completed $\rightarrow$ Completed (reverts)
  - Cancelled $\rightarrow$ Completed (reverts)
  - Cancelled $\rightarrow$ Cancelled (reverts)
- Query indexing (`getMyServices`, `getCustomerServices`, and pagination).

---

## 🚀 Deployment to BOT Chain Testnet

### 1. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate your deployer private key (ensure the account holds testnet `BOT` tokens for gas):
```env
BOTCHAIN_RPC_URL="https://rpc.bohr.life"
PRIVATE_KEY="0xyour_private_key_here"
```

### 2. Deploy Contract
Deploy the contract to BOT Chain Testnet:
```bash
npx hardhat run scripts/deploy.cjs --network botchainTestnet
```

The script will automatically compile the contract, deploy it to BOT Chain, and write the deployed address & ABI into `src/contracts/deployedContract.json`.

---

## 💻 Running the Frontend Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Vite Development Server
```bash
npm run dev
```

The application will be live at `http://localhost:3000`.

### 3. Connect Wallet
Click **Connect Wallet** in the top navigation bar. When prompted, select your preferred wallet (MetaMask, OKX, Rabby, etc.). Ensure your wallet is connected to **BOT Chain Testnet** (Chain ID: `968`).

---

## 🛡️ Security Guidelines
- **Zero Custody:** ServiceLog never asks for or stores private keys or seed phrases.
- **On-Chain Truth:** All statuses and metrics are derived directly from the immutable smart contract.
- **Transaction Confirmation Gate:** The dApp guarantees a transaction is not presented as successful until its block receipt is mined and confirmed on-chain.

