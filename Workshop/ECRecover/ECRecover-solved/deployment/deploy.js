const etherlime = require('etherlime');
const ECTools = require('../build/ECTools.json');
const ECToolsTest = require('../build/ECToolsTest.json');


const deploy = async (network, secret) => {

	const deployer = new etherlime.EtherlimeGanacheDeployer();
	const ECToolsWrapper = await deployer.deploy(ECTools);
	const TestContractWrapper = await deployer.deploy(ECToolsTest, { ECTools: ECToolsWrapper.contractAddress });


};

module.exports = {
	deploy
};