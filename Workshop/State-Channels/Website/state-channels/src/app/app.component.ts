import { Component } from '@angular/core';
import * as ethers from 'ethers';
import * as IPFS from 'ipfs';
import * as Room from 'ipfs-pubsub-room';
declare const Buffer;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public privateKey: string;
  constructor() { }


  public functionButton1() {
    console.log(this.privateKey);
  }

  public functionButton2() {
    console.log('function2');
  }

  public functionButton3() {
    console.log('function3');
  }
}
