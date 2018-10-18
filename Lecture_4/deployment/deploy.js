const etherlime = require('etherlime');
// const LimeFactory = require('../build/LimeFactory.json');
const Billboard = require('../build/Billboard.json');

const deploy = async (network, secret) => {


	//deploy our smart contracts on Etherlime Ganache Local Node!
	// const deployer = new etherlime.EtherlimeGanacheDeployer();
	// const result = await deployer.deploy(LimeFactory);
	// const billboardContractResult = await deployer.deploy(Billboard);

	//deploy our smart contract on Remote Test Net using Ufura Service!
	const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, 'abca6d1110b443b08ef271545f24b80d');
	const estimateGas = await deployer.estimateGas(Billboard);
	console.log(estimateGas);
	const contractWrapper = await deployer.deploy(Billboard);
	const setPriceInitialtransaction = await contractWrapper.contract.setPrice(50);
	await contractWrapper.verboseWaitForTransaction(setPriceInitialtransaction, 'Initial Set Price Transaction');
};

module.exports = {
	deploy
};