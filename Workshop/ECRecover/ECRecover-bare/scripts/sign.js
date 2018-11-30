const ethers = require('ethers');
const providers = ethers.providers;
const Wallet = ethers.Wallet;
const utils = ethers.utils;
const contractABI;

(async function () {

	if (process.argv.length < 5) {
		throw new Error('Invalid arguments');
	}

	const provider = new providers.JsonRpcProvider('http://localhost:8545');

	const privateKey = process.argv[2];
	const wallet = new Wallet(privateKey, provider);

	const message = process.argv[3];
	const hashMsg = utils.solidityKeccak256(['string'], [message]);

	const contractAddress = process.argv[4];

	// TODO sign the bytes32 message and send it to the contract. Verify locally and remotely

})()