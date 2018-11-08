const etherlime = require('etherlime');
const Billboard = require('../build/Billboard.json');

const deploy = async (network, secret) => {


	//deploy our smart contracts on Etherlime Ganache Local Node!
	// const deployer = new etherlime.EtherlimeGanacheDeployer();
	// const billboardContractResult = await deployer.deploy(Billboard);

	//deploy our smart contract on Remote Test Net using Ufura Service!
	const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, 'abca6d1110b443b08ef271545f24b80d');
	const contractWrapper = await deployer.deploy(Billboard);
};

module.exports = {
	deploy
};