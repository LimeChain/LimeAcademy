declare let require: any;
import { Component } from '@angular/core';

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

  constructor() {

  }

  public async getCurrentBlock() {

  }

  public async getGasPrice() {

  }

  public async getBillboardContent() {
  }

  public async getTransactionHash(transactionHash) {

  }

  public async moneySpent() {

  }
}