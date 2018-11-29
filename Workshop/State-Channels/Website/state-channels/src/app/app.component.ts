import {ChangeDetectorRef, Component} from '@angular/core';
import * as ethers from 'ethers';
import * as IPFS from 'ipfs';
import * as Room from 'ipfs-pubsub-room';
declare const Buffer;
const RSP = require('../contracts-json/RSP.json');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public playerOne: any;
  public playerTwo: any;
  public playerOneScore: any;
  public playerTwoScore: any;
  public lastMove: string;
  public privateKey: string;
  public ethersDeposit: string;
  public contractAddress: string;
  public stateText = 'Loading peers...';
  public turnInfo = '';
  public balance: string;
  public networkProvider: any;
  public wallet: any;
  public room: any;
  public nonce = 0;
  public randNum: number;
  public winPrize = ethers.utils.bigNumberify('1000000000000000000');
  constructor(private changeDetection: ChangeDetectorRef) {
    this.networkProvider = new ethers.providers.InfuraProvider('ropsten', 'jLCpladxNxIQQ2IbJ2Aw');
    // this.networkProvider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
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

    this.room = Room(ipfs, 'stateChannelDemo');

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
        console.log(`commit received: ${message.data}`);
        const confirmHash = await this.signConfirmCommit(data.sig, data.nonce);
        await this.sendHash(confirmHash);
      } else if (data.type === 'confirmCommit') {
        window.sessionStorage.setItem(data.type + data.nonce, message.data);
        console.log(`confirm commit received: ${message.data}`);
      } else if (data.type === 'reveal') {
        this.decryptOpponentMove(data);
        this.defineWinner(data);
        const stateHash = await this.signState();
        await this.sendHash(stateHash);
        console.log(`reveal received: ${message.data}`);
      } else if (data.type === 'state') {
        console.log(`state received: ${message.data}`);

        const pl1 = ethers.utils.bigNumberify(data.playerOneScore);
        const pl2 = ethers.utils.bigNumberify(data.playerTwoScore);

        console.log(`${data.playerOneAddress} => ${pl1.toString()}`);
        console.log(`${data.playerTwoAddress} => ${pl2.toString()}`);

        window.sessionStorage.setItem(data.type + data.nonce, message.data);
      } else if (data.type === 'player') {
        this.playerTwo = data.address;
        this.playerTwoScore = data.playerScore;
        console.log(`playerTwo: ${this.playerTwo}`);
        console.log(`playerTwoScore: ${this.playerTwoScore}`);
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

    // TODO: check is the address the right one
    console.log('CHECK THIS: ' + recoveredAddress);
  }

  public defineWinner(revealData) {
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
    const plOneScoreBN = ethers.utils.bigNumberify(this.playerOneScore);
    const plTwoScoreBN = ethers.utils.bigNumberify(this.playerTwoScore);

    this.playerOneScore = plOneScoreBN.add(this.winPrize);
    this.playerTwoScore = plTwoScoreBN.sub(this.winPrize);
  }

  public lostGame() {
    const plOneScoreBN = ethers.utils.bigNumberify(this.playerOneScore);
    const plTwoScoreBN = ethers.utils.bigNumberify(this.playerTwoScore);

    this.playerOneScore = plOneScoreBN.sub(this.winPrize);
    this.playerTwoScore = plTwoScoreBN.add(this.winPrize);
  }

  public async signState() {
    const hashMsg = ethers.utils.solidityKeccak256(['int', 'bytes', 'int', 'bytes', 'int'], [this.nonce - 1, this.playerOne, this.playerOneScore, this.playerTwo, this.playerTwoScore]);
    const hashData = ethers.utils.arrayify(hashMsg);
    const signature = await this.wallet.signMessage(hashData);

    return JSON.stringify({'type': 'state', 'nonce': this.nonce - 1, 'playerOneAddress': this.playerOne, 'playerOneScore': this.playerOneScore, 'playerTwoAddress': this.playerTwo, 'playerTwoScore': this.playerTwoScore, 'sig': signature});
  }

  public async openChannel() {
    const wei = ethers.utils.parseEther(this.ethersDeposit);
    const rspInstance = new ethers.Contract(this.contractAddress, RSP.abi, this.networkProvider);

    const rspInstanceForPlOne = await rspInstance.connect(this.wallet);
    await rspInstanceForPlOne.openChannel({
      value: wei
    });

    this.playerOneScore = wei;
    this.playerOne = this.wallet.address;

    console.log(`playerOne: ${this.playerOne}`);
    console.log(`playerOneScore: ${this.playerOneScore}`);

    const player  = JSON.stringify({'type': `player`, 'address': this.playerOne, 'playerScore': this.playerOneScore.toString()});
    this.sendPlayer(player);
  }

  public async joinChannel() {
    const wei = ethers.utils.parseEther(this.ethersDeposit);
    const rspInstance = new ethers.Contract(this.contractAddress, RSP.abi, this.networkProvider);

    const rspInstanceForPlTwo = await rspInstance.connect(this.wallet);
    await rspInstanceForPlTwo.joinChannel({
      value: wei
    });

    this.playerOneScore = wei;
    this.playerOne = this.wallet.address;

    console.log(`playerOne: ${this.playerOne}`);
    console.log(`playerOneScore: ${this.playerOneScore}`);

    const player  = JSON.stringify({'type': `player`, 'address': this.playerOne, 'playerScore': this.playerOneScore.toString()});
    this.sendPlayer(player);
  }

  public sendPlayer(playerAddress) {
    const peers = this.room.getPeers();
    this.room.sendTo(peers[0], playerAddress);
  }

  public async closeChannel() {
    const rspInstance = new ethers.Contract(this.contractAddress, RSP.abi, this.networkProvider);
    const rspInstanceWithWallet = await rspInstance.connect(this.wallet);

    const daForClosingChannel = window.sessionStorage.getItem(`state${(this.nonce - 1)}`);
    const data = JSON.parse(daForClosingChannel.toString());

    const plOneScoreBN = ethers.utils.bigNumberify(data.playerOneScore);
    const plTwoScoreBN = ethers.utils.bigNumberify(data.playerTwoScore);

    console.log(data.nonce);
    console.log(data.playerOneAddress);
    console.log(plOneScoreBN.toString());
    console.log(data.playerTwoAddress);
    console.log(plTwoScoreBN.toString());
    console.log(data.sig);

    await rspInstanceWithWallet.closeChannel(data.nonce, data.playerOneAddress, plOneScoreBN.toString(), data.playerTwoAddress, plTwoScoreBN.toString(), data.sig);
    console.log('Closing channel initiated');
  }

  public async claimPrize() {
    const rspInstance = new ethers.Contract(this.contractAddress, RSP.abi, this.networkProvider);
    const rspInstanceWithWallet = await rspInstance.connect(this.wallet);
    await rspInstanceWithWallet.payPrizes();
    console.log('Waiting to claim prize');
  }
}
