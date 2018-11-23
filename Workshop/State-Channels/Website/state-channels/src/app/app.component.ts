import {ChangeDetectorRef, Component} from '@angular/core';
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
  public stateText = 'Loading peers...';
  public turnInfo = '';
  public balance: string;
  public networkProvider: any;
  public wallet: any;
  public room: any;
  public nonce = 0;
  public randNum: number;
  constructor(private changeDetection: ChangeDetectorRef) {
    this.networkProvider = new ethers.providers.InfuraProvider('ropsten', 'jLCpladxNxIQQ2IbJ2Aw');
    const ipfs = new IPFS({
      repo: repo(),
      EXPERIMENTAL: {
        pubsub: true
      },
      config: {
        Addresses: {
          Swarm: [
            '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
          ]
        }
      }

    });

    ipfs.once('ready', () => ipfs.id((err, info) => {
      if (err) {throw err;}
      console.log('IPFS node ready with address ' + info.id);
    }));

    this.room = Room(ipfs, 'stateChannel');

    this.room.on('peer joined', (peer) => {
      console.log(`${peer} joined`);
      this.stateText = `${peer} joined`;
      this.changeDetection.detectChanges();
    });
    this.room.on('peer left', (peer) => {
      this.stateText = `${peer} left`;
      console.log(`${peer} left`);
      this.changeDetection.detectChanges();
    });
    this.room.on('message', (message) => {
      // const data = JSON.parse(message.data.toString());
      console.log(message.data);
    });

    function repo() {
      return 'ipfs/pubsub-demo/' + Math.random();
    }
  }

  public async unlockWallet() {
    this.wallet = new ethers.Wallet(this.privateKey, this.networkProvider);
    const walletBalance = await this.networkProvider.getBalance(this.wallet.address);
    this.balance = `Address: ${this.wallet.address}\nBalance: ${ethers.utils.formatEther(walletBalance)}`;
    this.changeDetection.detectChanges();
  }

  public async rock() {
    await this.sendMoveHash('Rock');
  }

  public async paper() {
    await this.sendMoveHash('Paper');
    // const test = window.localStorage.getItem('ogi');
  }

  public async scissors() {
    await this.sendMoveHash('Scissors');
    // window.localStorage.setItem('ogi', '123');
  }

  public async sendMoveHash(move) {
    console.log(move);
    this.randNum = Math.floor(Math.random() * (1000 - 1) + 1);

    const hashMsg = ethers.utils.solidityKeccak256(['string', 'int', 'int'], [move, this.nonce, this.randNum]);
    const hashData = ethers.utils.arrayify(hashMsg);
    const signature = await this.wallet.signMessage(hashData);

    const msg  = JSON.stringify({'sig': signature, 'move': move, 'randNum': this.randNum});
    window.localStorage.setItem(this.nonce.toString(), msg);

    const peers = this.room.getPeers();
    this.room.sendTo(peers[0], signature);

    this.nonce++;
    this.turnInfo += `${move}, nonce: ${this.nonce}, randNum: ${this.randNum}\n`;
    this.changeDetection.detectChanges();
  }
}
