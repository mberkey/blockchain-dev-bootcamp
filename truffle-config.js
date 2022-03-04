require('babel-register');
require('babel-polyfill');
require('dotenv').config();

module.exports = {
  networks: {
    development: { //Dev Network
      host: "127.0.0.1",      // Localhost (default: none)
      port: 9545,            // Ganache Port (default: none)
      network_id: "5777"     // Any network (default: none)
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
