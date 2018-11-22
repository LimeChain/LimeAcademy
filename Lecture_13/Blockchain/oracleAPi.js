const axios = require('axios');
const ethers = require('ethers');
const ETH_API = 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD,JPY,EUR'
const BillboardOracle = require('./build/BillboardOracle.json')
let ganacheProvider;
let deployedContract;
const contractAddress = "0x21F7052F9310D56837d26cd3eCC84d1025899e70"
let priceInUSD;


const getEthPrice = async () => {
	try {
		let response = await axios.get(ETH_API);
		priceInUSD = response.data.USD;

	} catch (e) {}

	updateRate();
	// setRateManually();
};

const updateRate = async () => {
	// ganacheProvider = await new ethers.providers.JsonRpcProvider("http://localhost:8545");

	let infuraProvider = new ethers.providers.InfuraProvider('ropsten');
	deployedContract = await new ethers.Contract(contractAddress, BillboardOracle.abi, infuraProvider);

	//Add your private key here
	const wallet = new ethers.Wallet("", infuraProvider);
	const connectedContract = deployedContract.connect(wallet);

	priceInUSD = Math.trunc(priceInUSD);
	let result = await connectedContract.setPrice(priceInUSD);
}

const setRateManually = async () => {
	// ganacheProvider = await new ethers.providers.JsonRpcProvider("http://localhost:8545");
	let infuraProvider = new ethers.providers.InfuraProvider('ropsten');
	deployedContract = await new ethers.Contract(contractAddress, BillboardOracle.abi, infuraProvider);

	//add you private key here
	const wallet = new ethers.Wallet("", infuraProvider);
	const connectedContract = deployedContract.connect(wallet);

	let result = await connectedContract.setPrice("10");
}



getEthPrice();