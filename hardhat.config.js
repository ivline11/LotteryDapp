require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();


const providerApiKey = process.env.ALCHEMY_API_KEY;

const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;

const etherscanApiKey = process.env.ETHERSCAN_API_KEY;


module.exports = {
  solidity: {
      version: "0.8.27", // Solidity 버전을 명시
      settings: {
          optimizer: {
              enabled: true,
              runs: 200,
          },
      },
  },
  networks: {
    hardhat: {},
    sepolia: { // 원하는 네트워크 추가
      url: `https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    }
  },
  etherscan: {
    apiKey: etherscanApiKey,
  }
}