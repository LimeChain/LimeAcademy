const etherlime = require('etherlime');
const Billboard = require('../build/Billboard.json');
const BillboardToken = require('../build/BillboardToken.json');

const ethers = require('ethers');

const deploy = async (network, secret) => {

	const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, 'abca6d1110b443b08ef271545f24b80d');
	const billboardTokenContract = await deployer.deploy(BillboardToken);
	const billboardContract = await deployer.deploy(Billboard, {}, billboardTokenContract.contractAddress);

	const user = deployer.wallet;

	const tx = await billboardTokenContract.contract.mint(user.address, 10000);
	await billboardTokenContract.verboseWaitForTransaction(tx, "Minting 10000 bill tokens");
	const ownerBalance = await billboardTokenContract.contract.balanceOf(user.address);
	console.log(ownerBalance.toString());

};

module.exports = {
	deploy
};