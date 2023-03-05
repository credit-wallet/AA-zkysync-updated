require('@matterlabs/hardhat-zksync-deploy');
require('@matterlabs/hardhat-zksync-solc');

module.exports = {
  zksolc: {
    version: '1.3.5',
    compilerSource: 'binary',
    settings: {
      isSystem: true
    }
  },
  defaultNetwork: 'zkSyncTestnet',
  networks: {
    hardhat: {
      zksync: true,
    },
    zkSyncTestnet: {
      url: 'http://localhost:3050/',
      ethNetwork: 'http://localhost:8545/', // Can also be the RPC URL of the network (e.g. `https://goerli.infura.io/v3/<API_KEY>`)
      zksync: true,
    },
  },
  solidity: {
    version: '0.8.16',
  },
};