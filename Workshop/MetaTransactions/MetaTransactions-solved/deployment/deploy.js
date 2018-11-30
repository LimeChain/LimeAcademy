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
	const MetaTokenContract = await deployer.deploy(MetaToken);
	const ECToolsContract = await deployer.deploy(ECTools);
	const MetaBatchContract = await deployer.deploy(MetaBatchProxy, { ECTools: ECToolsContract.contractAddress }, wallet.address)
	const BillboardContract = await deployer.deploy(Billboard, {}, MetaTokenContract.contractAddress);

	// Mint tokens
	const tx = await MetaTokenContract.contract.mint(MetaBatchContract.contractAddress, 10000);
	await MetaTokenContract.verboseWaitForTransaction(tx, 'Minting Transaction');

};

module.exports = {
	deploy
};