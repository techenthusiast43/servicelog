require("@nomicfoundation/hardhat-toolbox");
try {
  require("dotenv").config();
} catch (e) {
  // dotenv is optional
}

const getAccounts = () => {
  const pk = process.env.PRIVATE_KEY?.trim();
  if (!pk) return [];
  return [pk.startsWith("0x") ? pk : `0x${pk}`];
};

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    botchainTestnet: {
      url: process.env.BOTCHAIN_RPC_URL || "https://rpc.bohr.life",
      chainId: 968,
      accounts: getAccounts(),
    },
    botchainMainnet: {
      url: "https://rpc.botchain.ai",
      chainId: 677,
      accounts: getAccounts(),
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
