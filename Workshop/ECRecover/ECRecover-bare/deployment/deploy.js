const etherlime = require('etherlime');
const ECTools = require('../build/ECTools.json');


const deploy = async (network, secret) => {

	const deployer = new etherlime.EtherlimeGanacheDeployer();
	const ECToolsWrapper = await deployer.deploy(ECTools);

};

module.exports = {
	deploy
};