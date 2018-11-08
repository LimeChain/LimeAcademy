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
  public billboardPrice: string;
  public newSlogan: string;
  public newPrice: string;
  public privateKey = '09d63a68dafa08dffee686e044f8dc4fe4fc368011d757edf68de4fe8af89f82';
  public infuraApiKey = 'XTIF9kIt1kgSOOKclKG0';
  public infuraProvider: ethers.providers.InfuraProvider;
  public contractAddress = '0x8BA99E94C1651bc28B4Fb8c7a7b4B0Df82C29f18';
  public deployedContract: ethers.Contract;
  public etherscanLink: string;

  constructor() {
    this.infuraProvider = new ethers.providers.InfuraProvider('rinkeby', this.infuraApiKey);
    this.deployedContract = new ethers.Contract(this.contractAddress, Billboard.abi, this.infuraProvider);

  }

  public async getBillboardContent() {
    this.billboardContent = await this.deployedContract.slogan();
  }

  public async getBillboardPrice() {
    const price = await this.deployedContract.price();
    this.billboardPrice = price.toString();
  }

  public async buyBillboard() {
    // Initialize wallet with privateKey
    const wallet = new ethers.Wallet(this.privateKey, this.infuraProvider);
    const connectedContract = this.deployedContract.connect(wallet);
    const sentTransaction = await connectedContract.buy(this.newSlogan, { value: Number.parseInt(this.newPrice) });
    console.log(sentTransaction);
    this.etherscanLink = `https://rinkeby.etherscan.io/tx/${sentTransaction.hash}`;
    const receipt = await sentTransaction.wait();
    console.log(receipt);
  }

}


