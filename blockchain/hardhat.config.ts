import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const DEPLOYER_PRIVATE_KEY =
  process.env.DEPLOYER_PRIVATE_KEY ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // hardhat default

const ALCHEMY_POLYGON_URL   = process.env.ALCHEMY_POLYGON_URL   || "";
const ALCHEMY_ETHEREUM_URL  = process.env.ALCHEMY_ETHEREUM_URL  || "";
const POLYGONSCAN_API_KEY   = process.env.POLYGONSCAN_API_KEY   || "";
const ETHERSCAN_API_KEY     = process.env.ETHERSCAN_API_KEY     || "";

const config: HardhatUserConfig = {
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
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    polygon_mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_POLYGON_URL}`,
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 80001,
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_POLYGON_URL}`,
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 137,
    },
    ethereum_mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_ETHEREUM_URL}`,
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 1,
    },
  },
  etherscan: {
    apiKey: {
      polygon:      POLYGONSCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY,
      mainnet:      ETHERSCAN_API_KEY,
    },
  },
  paths: {
    sources:   "./contracts",
    tests:     "./test",
    cache:     "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
