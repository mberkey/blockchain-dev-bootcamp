require('babel-register');
require('babel-polyfill');
require('dotenv').config();

module.exports = {
  networks: {
    development: { //Dev Network
      host: "172.26.144.1",      // Localhost (default: none)
      port: 7545,            // Ganache Port (default: none)
      network_id: "*",     // Any network (default: none)
      gasPrice: 10000000000 
     },
  },
  contracts_directory: './src/contracts/',  //Dont forget last /
  contracts_build_directory: './src/abis/',
  compilers: { //Configure Compilers
    solc: {        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
         enabled: true,
          runs: 200
        },
    }
  }
};
