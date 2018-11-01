declare let require: any;
declare var web3: any;
import { Component } from '@angular/core';
import * as ethers from 'ethers';
const Billboard = require('./contract_interfaces/Billboard.json');
declare const Buffer;

@Component({
	selector: 'dapp-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {

	public billboardContent: string = null;
	public address: string;
	public newSlogan: string;
	public privateKey: string;
	public currentBlock: number;
	public gasPrice: string;
	public infuraApiKey = 'abca6d1110b443b08ef271545f24b80d';
	public infuraProvider: ethers.providers.InfuraProvider;
	public contractAddress = '0x78ed7A34D67fB3eAc745e7af78aE1bcA770C26de';
	public deployedContract: ethers.Contract;

	public password: string;
	public encryptPassword: string;
	public mnemonic: string;
	public json: string;
	public ipfsHash: string;


	constructor() {
		this.infuraProvider = new ethers.providers.InfuraProvider('rinkeby', this.infuraApiKey);
		this.infuraProvider.on('block', blockNumber => {
			this.currentBlock = blockNumber;
		});
		this.deployedContract = new ethers.Contract(this.contractAddress, Billboard.abi, this.infuraProvider);

		// Listen for event - Contract Level
		// this.deployedContract.on('LogBillboardBought', (address, weiSpent, slogan) => {
		//   alert(`Buyer with address: ${address} has bought slogan: ${slogan} for ${weiSpent} wei`);
		// });
	}

	public async getCurrentBlock() {
		this.currentBlock = await this.infuraProvider.getBlockNumber();
	}

	public async getGasPrice() {
		const price = await this.infuraProvider.getGasPrice();
		this.gasPrice = ethers.utils.formatEther(price.toNumber());
	}

	public async getBillboardContent() {
		this.billboardContent = await this.deployedContract.slogan();
	}

	public async getTransactionHash(transactionHash) {
		const transaction = await this.infuraProvider.getTransactionReceipt(transactionHash);
		console.log(transaction);
	}

	public async moneySpent() {
		const moneySpent = await this.deployedContract.moneySpent(this.address);
		console.log(moneySpent.toNumber());
	}

	public async buyBillboard() {

		// Take the encrypted Json from local storage, decrypt it and use it to sign transactions
		const json = window.localStorage.getItem('wallet');
		const initialWallet = await ethers.Wallet.fromEncryptedJson(json, this.password, callback);
		const wallet = initialWallet.connect(this.infuraProvider);
		const connectedContract = this.deployedContract.connect(wallet);
		const sentTransaction = await connectedContract.buy(this.newSlogan, { value: 51 });
		const transactionComplete = await this.infuraProvider.waitForTransaction(sentTransaction.hash);
		console.log(transactionComplete);
		alert('we are done');
		function callback(progress) {
			console.log('Decrypt: ' + progress * 100 + ' % completed');
		}
	}

	// Create random wallet and encrypt it with password to encrypted Json
	public async createWallet() {
		const wallet = ethers.Wallet.createRandom();
		const encryptedJson = await wallet.encrypt(this.encryptPassword, callback);
		console.log(encryptedJson);
		function callback(progress) {
			console.log('Encrypt: ' + progress * 100 + ' % completed');
		}

		window.localStorage.setItem('wallet', encryptedJson);
	}


	// Download the encrypted Json wallet from local storage
	public downloadOldJSONFile() {
		const json = JSON.parse(window.localStorage.getItem('wallet'));
		const downloader = document.createElement('a');
		document.body.appendChild(downloader); // Needed for ff;

		const data = JSON.stringify(json);
		const blob = new Blob([data], { type: 'text/json' });
		const url = window.URL;
		const fileUrl = url.createObjectURL(blob);

		downloader.setAttribute('href', fileUrl);
		downloader.setAttribute('download', 'wallet-backup.json');
		downloader.click();
	}

	public async upload() {
		const reader = new FileReader();
		const self = this;
		reader.onloadend = function () {
			const ipfs = window['IpfsApi']('localhost', 5001) // Connect to IPFS
			const buf = Buffer(reader.result) // Convert data into buffer

			ipfs.files.add(buf, (err, result) => { // Upload buffer to IPFS
				if (err) {
					console.error(err);
					return;
				}
				let url = `http://localhost:8080/ipfs/${result[0].hash}`;
				console.log(`Url --> ${url}`)
				self.ipfsHash = result[0].hash;
			})
		}
		const photo = document.getElementById("photo");
		reader.readAsArrayBuffer(photo['files'][0]); // Read Provided File
	}

}


