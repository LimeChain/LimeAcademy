const etherlime = require('etherlime');
const IBillboard = require('../build/IBillboard.json');
const Billboard = require('../build/Billboard.json');
const BillboardProxy = require('../build/BillboardProxy.json');
const IBillboard2 = require('../build/IBillboard2.json');
const Billboard2 = require('../build/Billboard2.json');

const deploy = async (network, secret) => {

	//deploy our smart contracts on Etherlime Ganache Local Node!
	const deployer = new etherlime.EtherlimeGanacheDeployer();
	const implementationWrapper = await deployer.deploy(Billboard);
	const proxyWrapper = await deployer.deploy(BillboardProxy, {}, implementationWrapper.contractAddress);
	const upgradeableBillboard = deployer.wrapDeployedContract(IBillboard, proxyWrapper.contractAddress);
	const initResult = await upgradeableBillboard.contract.init({
		gasLimit: 2000000
	});
	await upgradeableBillboard.verboseWaitForTransaction(initResult, 'Init transaction');
	// ==== Deploy Logic ==== 
	// 0xd9995bae12fee327256ffec1e3184d492bd94c31

	const setPriceInitialtransaction = await upgradeableBillboard.contract.setPrice(50, {
		gasLimit: 2000000
	});
	await upgradeableBillboard.verboseWaitForTransaction(setPriceInitialtransaction, 'Initial Set Price Transaction');

	// const price = await upgradeableBillboard.contract.getPrice();

	const buyTransaction = await upgradeableBillboard.contract.buy('Ogi Majstor', {
		value: 10000,
		gasLimit: 2000000
	})

	await upgradeableBillboard.verboseWaitForTransaction(buyTransaction, 'Buy Transaction');

	// ==== Upgradeable Implementation 1 ====

	const implementationWrapper2 = await deployer.deploy(Billboard2);

	const upgradeTransaction = await upgradeableBillboard.contract.upgradeImplementation(implementationWrapper2.contractAddress, {
		gasLimit: 2000000
	})

	await upgradeableBillboard.verboseWaitForTransaction(upgradeTransaction, 'Upgrade Transaction');

	const upgradeableBillboard2 = deployer.wrapDeployedContract(IBillboard2, proxyWrapper.contractAddress);

	const slogan = await upgradeableBillboard2.contract.getSlogan();

	console.log(slogan);

	const buy2Transaction = await upgradeableBillboard2.contract.buy('Ogi Golqm Majstor', 123123, {
		value: 10000,
		gasLimit: 2000000
	})

	await upgradeableBillboard2.verboseWaitForTransaction(buy2Transaction, 'Buy Transaction');

	const time = await upgradeableBillboard2.contract.getTime();

	console.log(time.toString());

	const slogan2 = await upgradeableBillboard2.contract.getSlogan();

	console.log(slogan2);

};

module.exports = {
	deploy
};