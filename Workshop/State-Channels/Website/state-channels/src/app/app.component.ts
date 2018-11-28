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
  public myScore = 5;
  public opponentScore = 5;
  public lastMove: string;
  public privateKey: string;
  public revealMsg: string;
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
            '/dnsaddr/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
            // '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star/'
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
    this.room.on('message', async (message) => {
      const data = JSON.parse(message.data.toString());
      if (data.type === 'commit') {
        window.sessionStorage.setItem(data.type + data.nonce, message.data);

        const confirmHash = await this.signConfirmCommit(data.sig, data.nonce);
        await this.sendHash(confirmHash);
      } else if (data.type === 'confirmCommit') {
        window.sessionStorage.setItem(data.type + data.nonce, message.data);
      } else if (data.type === 'reveal') {
        this.decryptOpponentMove(data);
        this.defineWinner(data);
        const stateHash = await this.signState();
        await this.sendHash(stateHash);
        // window.sessionStorage.setItem('state' + (this.nonce - 1).toString(), stateHash);
      } else if (data.type === 'state') {
        console.log(data);
        console.log(message.data.toString());
        window.sessionStorage.setItem(data.type + data.nonce, message.data);
      }
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
    this.lastMove = 'Rock';
    const moveHash = await this.signMove(this.lastMove);
    await this.sendHash(moveHash);

    const myTurn  = JSON.stringify({'type': `myTurn`, 'move': this.lastMove, 'randNum': this.randNum, 'nonce': this.nonce});
    window.sessionStorage.setItem('myTurn' + this.nonce.toString(), myTurn);

    this.turnInfo += `move: ${this.lastMove}, nonce: ${this.nonce}, randNum: ${this.randNum}`;
    this.changeDetection.detectChanges();
    this.nonce++;
  }

  public async paper() {
    this.lastMove = 'Paper';
    const moveHash = await this.signMove(this.lastMove);
    await this.sendHash(moveHash);

    const myTurn  = JSON.stringify({'type': `myTurn`, 'move': this.lastMove, 'randNum': this.randNum, 'nonce': this.nonce});
    window.sessionStorage.setItem('myTurn' + this.nonce.toString(), myTurn);

    this.turnInfo += `move: ${this.lastMove}, nonce: ${this.nonce}, randNum: ${this.randNum}`;
    this.changeDetection.detectChanges();
    this.nonce++;
  }

  public async scissors() {
    this.lastMove = 'Scissors';
    const moveHash = await this.signMove(this.lastMove);
    await this.sendHash(moveHash);

    const myTurn  = JSON.stringify({'type': `myTurn`, 'move': this.lastMove, 'randNum': this.randNum, 'nonce': this.nonce});
    window.sessionStorage.setItem('myTurn' + this.nonce.toString(), myTurn);

    this.turnInfo += `move: ${this.lastMove}, nonce: ${this.nonce}, randNum: ${this.randNum}`;
    this.changeDetection.detectChanges();
    this.nonce++;
  }

  public async signMove(move) {
    this.randNum = Math.floor(Math.random() * (1000 - 1) + 1);

    const hashMsg = ethers.utils.solidityKeccak256(['string', 'int', 'int'], [move, this.nonce, this.randNum]);
    const hashData = ethers.utils.arrayify(hashMsg);
    const signature = await this.wallet.signMessage(hashData);

    return JSON.stringify({'type': 'commit', 'nonce': this.nonce, 'sig': signature});
  }

  public async signConfirmCommit(commit, nonce) {
    const hashMsg = ethers.utils.solidityKeccak256(['string'], [commit]);
    const hashData = ethers.utils.arrayify(hashMsg);
    const signature = await this.wallet.signMessage(hashData);

    return JSON.stringify({'type': 'confirmCommit', 'nonce': nonce, 'sig': signature});
  }

  public revealLastMove() {
    const peers = this.room.getPeers();
    const revealMsg = JSON.stringify({'type': 'reveal', 'move': this.lastMove, 'randNum': this.randNum});
    this.room.sendTo(peers[0], revealMsg);
  }

  public sendHash(hash) {
    const peers = this.room.getPeers();
    this.room.sendTo(peers[0], hash);
  }

  public decryptOpponentMove(revealData) {
    const moveHash = window.sessionStorage.getItem(`commit${this.nonce - 1}`);
    const data = JSON.parse(moveHash);

    const dataSig = ethers.utils.splitSignature(data.sig);

    const msg = ethers.utils.solidityKeccak256(['string', 'int', 'int'], [revealData.move, this.nonce - 1, revealData.randNum]);
    const hashData = ethers.utils.hashMessage(ethers.utils.arrayify(msg));

    const recoveredAddress = ethers.utils.recoverAddress(hashData, dataSig);
    console.log(recoveredAddress);

    // TODO: check is the address the right one
  }

  public async defineWinner(revealData) {
    if (this.lastMove === revealData.move) {
      console.log('we both chose the same item');
    } else if (this.lastMove === 'Rock') {
      if (revealData.move === 'Paper') {
        console.log('I lost');
        this.lostGame();
      } else if (revealData.move === 'Scissors') {
        console.log('I Win');
        this.winGame();
      }
    } else if (this.lastMove === 'Paper') {
      if (revealData.move === 'Scissors') {
        console.log('I lost');
        this.lostGame();
      } else if (revealData.move === 'Rock') {
        console.log('I Win');
        this.winGame();
      }
    } else if (this.lastMove === 'Scissors') {
      if (revealData.move === 'Rock') {
        console.log('I lost');
        this.lostGame();
      } else if (revealData.move === 'Paper') {
        console.log('I Win');
        this.winGame();
      }
    }
  }

  public winGame() {
    this.myScore++;
    this.opponentScore--;
  }

  public lostGame() {
    this.myScore--;
    this.opponentScore++;
  }

  public async signState() {
    const hashMsg = ethers.utils.solidityKeccak256(['int', 'int', 'int'], [this.nonce - 1, this.myScore, this.opponentScore]);
    const hashData = ethers.utils.arrayify(hashMsg);
    const signature = await this.wallet.signMessage(hashData);

    return JSON.stringify({'type': 'state', 'nonce': this.nonce - 1, 'myScore': this.myScore, 'opponentScore': this.opponentScore, 'sig': signature});
  }
}
