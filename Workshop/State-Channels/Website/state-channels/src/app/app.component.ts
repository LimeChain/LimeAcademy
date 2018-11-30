import { ChangeDetectorRef, Component } from '@angular/core';
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
  public ipfs: IPFS;
  constructor(private changeDetection: ChangeDetectorRef) {
    // this.networkProvider = new ethers.providers.InfuraProvider('ropsten', 'jLCpladxNxIQQ2IbJ2Aw');
    this.networkProvider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

    this.ConnectToRoom();
    this.listenForEvents().then( async () => {});
  }

  private ConnectToRoom() {
    this.ipfs = new IPFS({
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

    this.ipfs.once('ready', () => this.ipfs.id((err, info) => {
      if (err) { throw err; }
      this.printAppInfo(`IPFS node ready with address ${info.id}`);
    }));

    function repo() {
      return 'ipfs/pubsub-demo/' + Math.random();
    }

    this.room = Room(this.ipfs, 'stateChannelDemo');
  }

  public async unlockWallet() {
    this.wallet = new ethers.Wallet(this.privateKey, this.networkProvider);
    const walletBalance = await this.networkProvider.getBalance(this.wallet.address);
    this.balance = `Address: ${this.wallet.address}\nBalance: ${ethers.utils.formatEther(walletBalance)}`;
    this.changeDetection.detectChanges();
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

    this.printMyData(`playerOne: ${this.playerOne}`);
    this.printMyData(`playerOneScore: ${this.playerOneScore}`);

    const player = JSON.stringify({ 'type': `player`, 'address': this.playerOne, 'playerScore': this.playerOneScore.toString() });
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

    this.printMyData(`playerOne: ${this.playerOne}`);
    this.printMyData(`playerOneScore: ${this.playerOneScore}`);

    const player = JSON.stringify({ 'type': `player`, 'address': this.playerOne, 'playerScore': this.playerOneScore.toString() });
    this.sendPlayer(player);
  }

  public sendPlayer(playerAddress) {
    const peers = this.room.getPeers();
    this.room.sendTo(peers[0], playerAddress);
  }

  public async rock() {
    this.lastMove = 'Rock';
    const moveHash = await this.signMove(this.lastMove);
    await this.sendHash(moveHash);

    const myTurn = JSON.stringify({ 'type': `myTurn`, 'move': this.lastMove, 'randNum': this.randNum, 'nonce': this.nonce });
    window.sessionStorage.setItem('myTurn' + this.nonce.toString(), myTurn);

    this.turnInfo += `move: ${this.lastMove}, nonce: ${this.nonce}, randNum: ${this.randNum}`;
    this.changeDetection.detectChanges();
    this.nonce++;
  }

  public async paper() {
    this.lastMove = 'Paper';
    const moveHash = await this.signMove(this.lastMove);
    await this.sendHash(moveHash);

    const myTurn = JSON.stringify({ 'type': `myTurn`, 'move': this.lastMove, 'randNum': this.randNum, 'nonce': this.nonce });
    window.sessionStorage.setItem('myTurn' + this.nonce.toString(), myTurn);

    this.turnInfo += `move: ${this.lastMove}, nonce: ${this.nonce}, randNum: ${this.randNum}`;
    this.changeDetection.detectChanges();
    this.nonce++;
  }

  public async scissors() {
    this.lastMove = 'Scissors';
    const moveHash = await this.signMove(this.lastMove);
    await this.sendHash(moveHash);

    const myTurn = JSON.stringify({ 'type': `myTurn`, 'move': this.lastMove, 'randNum': this.randNum, 'nonce': this.nonce });
    window.sessionStorage.setItem('myTurn' + this.nonce.toString(), myTurn);

    this.turnInfo += `move: ${this.lastMove}, nonce: ${this.nonce}, randNum: ${this.randNum}`;
    this.changeDetection.detectChanges();
    this.nonce++;
  }

  public revealLastMove() {
    const peers = this.room.getPeers();
    const revealMsg = JSON.stringify({ 'type': 'reveal', 'move': this.lastMove, 'randNum': this.randNum });
    this.room.sendTo(peers[0], revealMsg);
  }

  public async signMove(move) {
    this.randNum = Math.floor(Math.random() * (1000 - 1) + 1);

    const hashMsg = ethers.utils.solidityKeccak256(['string', 'int', 'int'], [move, this.nonce, this.randNum]);
    const hashData = ethers.utils.arrayify(hashMsg);
    const signature = await this.wallet.signMessage(hashData);

    return JSON.stringify({ 'type': 'commit', 'nonce': this.nonce, 'sig': signature });
  }

  public async signConfirmCommit(commit, nonce) {
    const hashMsg = ethers.utils.solidityKeccak256(['string'], [commit]);
    const hashData = ethers.utils.arrayify(hashMsg);
    const signature = await this.wallet.signMessage(hashData);

    return JSON.stringify({ 'type': 'confirmCommit', 'nonce': nonce, 'sig': signature });
  }

  public async signState() {
    const hashMsg = ethers.utils.solidityKeccak256(['int', 'bytes', 'int', 'bytes', 'int'], [this.nonce - 1, this.playerOne, this.playerOneScore, this.playerTwo, this.playerTwoScore]);
    const hashData = ethers.utils.arrayify(hashMsg);
    const signature = await this.wallet.signMessage(hashData);

    return JSON.stringify({ 'type': 'state', 'nonce': this.nonce - 1, 'playerOneAddress': this.playerOne, 'playerOneScore': this.playerOneScore, 'playerTwoAddress': this.playerTwo, 'playerTwoScore': this.playerTwoScore, 'sig': signature });
  }

  public sendHash(hash) {
    const peers = this.room.getPeers();
    this.room.sendTo(peers[0], hash);
  }

  private async listenForEvents() {
    this.room.on('peer joined', (peer) => {
      this.printAppInfo(`${peer} joined`);
      // this.stateText = `${peer} joined`;
      this.changeDetection.detectChanges();
    });
    this.room.on('peer left', (peer) => {
      // this.stateText = `${peer} left`;
      this.printAppInfo(`${peer} left`);
      this.changeDetection.detectChanges();
    });
    this.room.on('message', async (message) => {
      const data = JSON.parse(message.data.toString());
      if (data.type === 'commit') {
        window.sessionStorage.setItem(data.type + data.nonce, message.data);
        this.printMyData(`commit received: ${message.data}`);
        const confirmHash = await this.signConfirmCommit(data.sig, data.nonce);
        await this.sendHash(confirmHash);
      } else if (data.type === 'confirmCommit') {
        window.sessionStorage.setItem(data.type + data.nonce, message.data);
        this.printMyData(`confirm commit received: ${message.data}`);
      } else if (data.type === 'reveal') {
        this.decryptOpponentMove(data);
        this.defineWinner(data);
        const stateHash = await this.signState();
        await this.sendHash(stateHash);
        this.printMyData(`reveal received: ${message.data}`);
      } else if (data.type === 'state') {
        this.printMyData(`state received: ${message.data}`);

        const pl1 = ethers.utils.bigNumberify(data.playerOneScore);
        const pl2 = ethers.utils.bigNumberify(data.playerTwoScore);

        this.printMyData(`${data.playerOneAddress} => ${pl1.toString()}`);
        this.printMyData(`${data.playerTwoAddress} => ${pl2.toString()}`);

        window.sessionStorage.setItem(data.type + data.nonce, message.data);
      } else if (data.type === 'player') {
        this.playerTwo = data.address;
        this.playerTwoScore = data.playerScore;
        this.printMyData(`playerTwo: ${this.playerTwo}`);
        this.printMyData(`playerTwoScore: ${this.playerTwoScore}`);
      }
    });
  }

  public defineWinner(revealData) {
    if (this.lastMove === revealData.move) {
      this.printMyData('we both chose the same item');
    } else if (this.lastMove === 'Rock') {
      if (revealData.move === 'Paper') {
        this.printMyData('I lost');
        this.lostGame();
      } else if (revealData.move === 'Scissors') {
        this.printMyData('I Win');
        this.winGame();
      }
    } else if (this.lastMove === 'Paper') {
      if (revealData.move === 'Scissors') {
        this.printMyData('I lost');
        this.lostGame();
      } else if (revealData.move === 'Rock') {
        this.printMyData('I Win');
        this.winGame();
      }
    } else if (this.lastMove === 'Scissors') {
      if (revealData.move === 'Rock') {
        this.printMyData('I lost');
        this.lostGame();
      } else if (revealData.move === 'Paper') {
        this.printMyData('I Win');
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

  public decryptOpponentMove(revealData) {
    const moveHash = window.sessionStorage.getItem(`commit${this.nonce - 1}`);
    const data = JSON.parse(moveHash);

    const dataSig = ethers.utils.splitSignature(data.sig);

    const msg = ethers.utils.solidityKeccak256(['string', 'int', 'int'], [revealData.move, this.nonce - 1, revealData.randNum]);
    const hashData = ethers.utils.hashMessage(ethers.utils.arrayify(msg));

    const recoveredAddress = ethers.utils.recoverAddress(hashData, dataSig);
    this.printMyData(`This is the recover(opponent) address: ${recoveredAddress}`)
    // TODO: check if the recovered address the right one
  }

  public async closeChannel() {
    const rspInstance = new ethers.Contract(this.contractAddress, RSP.abi, this.networkProvider);
    const rspInstanceWithWallet = await rspInstance.connect(this.wallet);

    const daForClosingChannel = window.sessionStorage.getItem(`state${(this.nonce - 1)}`);
    const data = JSON.parse(daForClosingChannel.toString());

    const plOneScoreBN = ethers.utils.bigNumberify(data.playerOneScore);
    const plTwoScoreBN = ethers.utils.bigNumberify(data.playerTwoScore);

    await rspInstanceWithWallet.closeChannel(data.nonce, data.playerOneAddress, plOneScoreBN.toString(), data.playerTwoAddress, plTwoScoreBN.toString(), data.sig);
    this.printMyData(`Closing channel with the following arguments: nonce: ${data.nonce}, plOneAddr: ${data.playerOneAddress}, plOneScore: ${data.playerOneScore.toString()}, plTwoScore: ${data.playerTwoScore.toString()}, sig: ${data.sig}`);
  }

  public async claimPrize() {
    const rspInstance = new ethers.Contract(this.contractAddress, RSP.abi, this.networkProvider);
    const rspInstanceWithWallet = await rspInstance.connect(this.wallet);

    await rspInstanceWithWallet.payPrizes({gasLimit: 4000000});
    this.printMyData('Waiting to claim prize');
  }

  public printMyData(data) {
    console.log(data);
  }

  public printAppInfo(data) {
    console.log(data);
  }
}
