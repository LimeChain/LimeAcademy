const etherlime = require('etherlime');
const LimeFactory = require('../build/LimeFactory.json');
const LimeFactoryString = require('../build/LimeFactoryString.json');
const LimeLoop = require('../build/LimeLoop.json');
const BillboardOracle = require('../build/BillboardOracle.json');
const Billboard = require('../build/Billboard.json');
const slogan = "Edingmnogoolqmslogan"
const otherSlogan = "Drugmnogogolqmslogan";
const ethers = require('ethers');


const deploy = async (network, secret) => {

	let convertedSlogan = ethers.utils.formatBytes32String(slogan)
	let convertedSlogan2 = ethers.utils.formatBytes32String(otherSlogan)

	// const deployer = new etherlime.EtherlimeGanacheDeployer();
	//Your private key and infura APi key here
	const deployer = new etherlime.InfuraPrivateKeyDeployer('', 'ropsten', '', {});

	const result = await deployer.deploy(LimeFactory, {}, convertedSlogan, convertedSlogan2);
	const result2 = await deployer.deploy(LimeFactoryString, {}, slogan, otherSlogan);
	const result3 = await deployer.deploy(LimeLoop);
	const result4 = await deployer.deploy(BillboardOracle, {}, "20");
	const result5 = await deployer.deploy(Billboard, {}, result4.contractAddress, "SLogan");


};

module.exports = {
	deploy
};