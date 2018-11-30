const etherlime = require('etherlime');
const ECTools = require('../build/ECTools.json');
const MetaBatchProxy = require('../build/MetaBatchProxy.json');
const MetaToken = require('../build/MetaToken.json');
const Billboard = require('../build/Billboard.json');
const ethers = require('ethers');
const utils = ethers.utils;


const deploy = async (network, secret) => {
	const deployer = new etherlime.EtherlimeGanacheDeployer();
	const wallet = deployer.wallet;

	// Deploying contracts
	// TODO deploy token, tools, batchProxy and Billboard

	// Mint tokens
	// TODO mint tokens to the proxy contract address

};

module.exports = {
	deploy
};