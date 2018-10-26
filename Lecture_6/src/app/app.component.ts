declare let require: any;
declare var web3: any;
import { Component } from '@angular/core';
import * as ethers from 'ethers';
const Billboard = require('./contract_interfaces/Billboard.json');

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

    // Initialize wallet with privateKey
    // const wallet = new ethers.Wallet(this.privateKey, this.infuraProvider);
    // const connectedContract = this.deployedContract.connect(wallet);
    // const sentTransaction = await connectedContract.buy(this.newSlogan, { value: 10 });
    // const transactionComplete = await this.infuraProvider.waitForTransaction(sentTransaction.hash);
    // console.log(transactionComplete);
    // alert('we are done');

    // Initialize wallet with mnemonic
    // const initialWallet = ethers.Wallet.fromMnemonic(this.mnemonic);
    // const wallet = initialWallet.connect(this.infuraProvider);
    // const connectedContract = this.deployedContract.connect(wallet);
    // const sentTransaction = await connectedContract.buy(this.newSlogan, { value: 51 });
    // const transactionComplete = await this.infuraProvider.waitForTransaction(sentTransaction.hash);
    // console.log(transactionComplete);
    // alert('we are done');

    // Initialize wallet with encrypted Json
    // const initialWallet = await ethers.Wallet.fromEncryptedJson(this.json, this.password, callback);
    // const wallet = initialWallet.connect(this.infuraProvider);
    // const connectedContract = this.deployedContract.connect(wallet);
    // const sentTransaction = await connectedContract.buy(this.newSlogan, { value: 51 });
    // const transactionComplete = await this.infuraProvider.waitForTransaction(sentTransaction.hash);
    // console.log(transactionComplete);
    // alert('we are done');
    // function callback(progress) {
    //   console.log('Decrypt: ' + progress * 100 + ' % completed');
    // }

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


    // Use web3Provider to initialize signer and use it to sign transactions with MetaMask
    // const web3Provider = new ethers.providers.Web3Provider(web3.currentProvider);
    // const signer = web3Provider.getSigner();
    // const connectedContract = await this.deployedContract.connect(signer);
    // const sentTransaction = await connectedContract.buy(this.newSlogan, { value: 50 });


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

}


