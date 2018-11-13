module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*",
    },
    ganache: {
      host: "localhost",
      port: 7545,
      network_id: "5777",
    },
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 999
    }
  }
};