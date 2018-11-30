const ethers = require('ethers');
const providers = ethers.providers;
const Wallet = ethers.Wallet;
const utils = ethers.utils;
const contractABI = require('../build/ECToolsTest.json').abi;

(async function () {

	if (process.argv.length < 5) {
		throw new Error('Invalid arguments');
	}

	const privateKey = process.argv[2];
	const message = process.argv[3];
	const contractAddress = process.argv[4];

	const provider = new providers.JsonRpcProvider('http://localhost:8545');

	const wallet = new Wallet(privateKey, provider);

	const hashMsg = utils.solidityKeccak256(['string'], [message]);
	var hashData = utils.arrayify(hashMsg);
	const signature = await wallet.signMessage(hashData);

	const testContract = new ethers.Contract(contractAddress, contractABI, wallet);
	const result = await testContract.recover(hashMsg, signature);

	console.log('local verify: ', utils.verifyMessage(hashData, signature));
	console.log('remote verify: ', result);

})()