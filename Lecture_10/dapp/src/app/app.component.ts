declare let require: any;
declare var web3: any;
import { Component } from '@angular/core';
import * as ethers from 'ethers';
const Billboard = require('./contract_interfaces/Billboard.json');
const BillboardToken = require('./contract_interfaces/BillboardToken.json');

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
  public billboardContractAddress = '0xdFe2F30221dF1aD6d30c1dB29e10486552981823';
  public billboardTokenContractAddress = '0xd33f300a4adCcBCC7656d75e24B00471A8D9e64a';
  public billboardContract: ethers.Contract;
  public billboardTokenContract: ethers.Contract;
  public etherscanLink: string;

  constructor() {
    this.infuraProvider = new ethers.providers.InfuraProvider('rinkeby', this.infuraApiKey);
    this.billboardContract = new ethers.Contract(this.billboardContractAddress, Billboard.abi, this.infuraProvider);
    this.billboardTokenContract = new ethers.Contract(this.billboardTokenContractAddress, BillboardToken.abi, this.infuraProvider);

  }

  public async getBillboardContent() {
    this.billboardContent = await this.billboardContract.slogan();
  }

  public async getBillboardPrice() {
    const price = await this.billboardContract.price();
    this.billboardPrice = price.toString();
  }

  public async buyBillboard() {
    // Initialize wallet with privateKey
    const wallet = new ethers.Wallet(this.privateKey, this.infuraProvider);
    const connectedTokenContract = this.billboardTokenContract.connect(wallet);
    const connectedBillboardContract = this.billboardContract.connect(wallet);

    // Step 1: Approve
    const approveTransaction = await connectedTokenContract.approve(connectedBillboardContract.address, Number.parseInt(this.newPrice));
    this.etherscanLink = `https://rinkeby.etherscan.io/tx/${approveTransaction.hash}`;
    await approveTransaction.wait();

    // Step 2: Buy
    const buyTransaction = await connectedBillboardContract.buy(this.newSlogan, Number.parseInt(this.newPrice));
    this.etherscanLink = `https://rinkeby.etherscan.io/tx/${buyTransaction.hash}`;
    await buyTransaction.wait();
  }

}


