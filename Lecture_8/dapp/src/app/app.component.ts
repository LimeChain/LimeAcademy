declare let require: any;
declare var web3: any;
import { Component } from '@angular/core';
import * as ethers from 'ethers';
import * as IPFS from 'ipfs-api';
const ipfs = new IPFS('localhost', 5001)
declare const Buffer;

const Billboard = require('./contract_interfaces/Billboard.json');

@Component({
	selector: 'dapp-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {

	public billboardContent: string = null;
	public sloganHash: string;
	public address: string;
	public newSlogan: string;
	public privateKey: string;
	public currentBlock: number;
	public gasPrice: string;
	public infuraApiKey = 'abca6d1110b443b08ef271545f24b80d';
	public infuraProvider: ethers.providers.InfuraProvider;
	public contractAddress = '0x4f9F104209BB124Ce846F156939075953eC5f34D';
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
		this.sloganHash = await this.deployedContract.ipfsHash();
		console.log(this.sloganHash);
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
		const initialWallet = await ethers.Wallet.fromEncryptedJson(json, this.password);
		const wallet = initialWallet.connect(this.infuraProvider);
		const connectedContract = this.deployedContract.connect(wallet);
		console.log(this.ipfsHash);
		const sentTransaction = await connectedContract.buy(this.newSlogan, this.ipfsHash, { value: 51 });
		const transactionComplete = await this.infuraProvider.waitForTransaction(sentTransaction.hash);
		console.log(transactionComplete);
		alert('we are done');

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
			const buf = Buffer(reader.result); // Convert data into buffer
			ipfs.files.add(buf, (error, result) => {
				if (error) {
					console.log("something went wrong");
				}
				console.log(result[0].hash);
				self.ipfsHash = result[0].hash;
			})
		}
		const photo = document.getElementById("photo");
		reader.readAsArrayBuffer(photo['files'][0]); // Read Provided File
	}

}


