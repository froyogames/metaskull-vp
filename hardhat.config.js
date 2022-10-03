require("@nomicfoundation/hardhat-toolbox");
GOERLI_PRIVATE_KEY = '3a43041e152cdf7b44ae39985975837c29fa2d7a20d029828bc4c6c1142077dd';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  etherscan:{
    apiKey: "QBKXNWS5YVVYDU7WK8RBK2K8HSA3V4R72R",
  },
  networks: {
    goerli: {
      url: `https://eth-mainnet.g.alchemy.com/v2/WkbbkWkJVgKW5vKZJm-draVdF7EL79AX`,
      accounts: [GOERLI_PRIVATE_KEY],
    },
  }
};
