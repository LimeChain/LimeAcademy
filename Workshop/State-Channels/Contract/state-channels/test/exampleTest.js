const etherlime = require('etherlime');
const rsp = require('../build/RSP');
const ecTools = require('../build/ECTools.json');
const ethers = require('ethers');

describe('Example', () => {
    let accountNine = accounts[9];
    let deployer;
    let provider;

    let plOneContract;
    let plTwoContract;

    const playerOne = accounts[0];
    const playerTwo = accounts[1];

    beforeEach(async () => {
        deployer = new etherlime.EtherlimeGanacheDeployer(accountNine.secretKey);
        provider = deployer.provider;
        let ecToolsInstance = await deployer.deploy(ecTools);
        let deployedContractWrapper = await deployer.deploy(rsp, {"ECTools": ecToolsInstance.contract.address});

        playerOne.wallet = playerOne.wallet.connect(deployer.provider);
        playerTwo.wallet = playerTwo.wallet.connect(deployer.provider);

        plOneContract = await deployedContractWrapper.contract.connect(playerOne.wallet, {gasLimit: 8000000});
        plTwoContract = await deployedContractWrapper.contract.connect(playerTwo.wallet, {gasLimit: 8000000});
        await plOneContract.openChannel({value: 5});
        await plTwoContract.joinChannel({value: 5});
    });

    it('should set players addresses correctly', async () => {
        let pl1 = await plOneContract.playerOne();
        let pl2 = await plOneContract.playerTwo();
        assert.strictEqual(pl1, playerOne.wallet.address);
        assert.strictEqual(pl2, playerTwo.wallet.address);
    });

    it('should set prices correctly after closing channel', async () => {

        let pl1Prize = 6;
        let pl2Prize = 4;
        let nonce = 2;

        const hashMsg = ethers.utils.solidityKeccak256(['int', 'bytes', 'int', 'bytes', 'int'], [nonce, playerOne.wallet.address, pl1Prize, playerTwo.wallet.address, pl2Prize]);
        const hashData = ethers.utils.arrayify(hashMsg);
        const signature = await playerTwo.wallet.signMessage(hashData);

        await plOneContract.closeChannel(nonce, playerOne.wallet.address, pl1Prize, playerTwo.wallet.address, pl2Prize, signature);

        let prisePlayerOne = await plOneContract.addressToPrize(playerOne.wallet.address);
        let prisePlayerTwo = await plOneContract.addressToPrize(playerTwo.wallet.address);

        assert.strictEqual(prisePlayerOne.toNumber(), pl1Prize);
        assert.strictEqual(prisePlayerTwo.toNumber(), pl2Prize);

    });

    it('should not enter close dispute if dispute already activate', async () => {

        // close

        let pl1Prize = 6;
        let pl2Prize = 4;
        let nonce = 2;

        const hashMsg = ethers.utils.solidityKeccak256(['int', 'bytes', 'int', 'bytes', 'int'], [nonce, playerOne.wallet.address, pl1Prize, playerTwo.wallet.address, pl2Prize]);
        const hashData = ethers.utils.arrayify(hashMsg);
        const signature = await playerTwo.wallet.signMessage(hashData);

        await plOneContract.closeChannel(nonce, playerOne.wallet.address, pl1Prize, playerTwo.wallet.address, pl2Prize, signature);

        // close dispute

        let pl1PrizeDispute = 3;
        let pl2PrizeDispute = 7;
        let nonceDispute = 3;

        const hashMsgDispute = ethers.utils.solidityKeccak256(['int', 'bytes', 'int', 'bytes', 'int'], [nonceDispute, playerOne.wallet.address, pl1PrizeDispute, playerTwo.wallet.address, pl2PrizeDispute]);
        const hashDataDispute = ethers.utils.arrayify(hashMsgDispute);
        const signatureDispute = await playerTwo.wallet.signMessage(hashDataDispute);

        await assert.revert(plOneContract.closeChannel(nonceDispute, playerOne.wallet.address, pl1PrizeDispute, playerTwo.wallet.address, pl2PrizeDispute, signatureDispute));

    });

    it('should set prices correctly after closing channel dispute', async () => {

        // close

        let pl1Prize = 6;
        let pl2Prize = 4;
        let nonce = 2;

        const hashMsg = ethers.utils.solidityKeccak256(['int', 'bytes', 'int', 'bytes', 'int'], [nonce, playerOne.wallet.address, pl1Prize, playerTwo.wallet.address, pl2Prize]);
        const hashData = ethers.utils.arrayify(hashMsg);
        const signature = await playerTwo.wallet.signMessage(hashData);

        await plOneContract.closeChannel(nonce, playerOne.wallet.address, pl1Prize, playerTwo.wallet.address, pl2Prize, signature);

        // close dispute

        let pl1PrizeDispute = 3;
        let pl2PrizeDispute = 7;
        let nonceDispute = 3;

        const hashMsgDispute = ethers.utils.solidityKeccak256(['int', 'bytes', 'int', 'bytes', 'int'], [nonceDispute, playerOne.wallet.address, pl1PrizeDispute, playerTwo.wallet.address, pl2PrizeDispute]);
        const hashDataDispute = ethers.utils.arrayify(hashMsgDispute);
        const signatureDispute = await playerOne.wallet.signMessage(hashDataDispute);

        await plTwoContract.closeChannelDispute(nonceDispute, playerOne.wallet.address, pl1PrizeDispute, playerTwo.wallet.address, pl2PrizeDispute, signatureDispute);


        let prisePlayerOne = await plOneContract.addressToPrize(playerOne.wallet.address);
        let prisePlayerTwo = await plOneContract.addressToPrize(playerTwo.wallet.address);

        assert.strictEqual(prisePlayerOne.toNumber(), pl1PrizeDispute);
        assert.strictEqual(prisePlayerTwo.toNumber(), pl2PrizeDispute);

    });

    it('should set prices correctly after third dispute', async () => {

        // close

        let pl1Prize = 6;
        let pl2Prize = 4;
        let nonce = 2;

        const hashMsg = ethers.utils.solidityKeccak256(['int', 'bytes', 'int', 'bytes', 'int'], [nonce, playerOne.wallet.address, pl1Prize, playerTwo.wallet.address, pl2Prize]);
        const hashData = ethers.utils.arrayify(hashMsg);
        const signature = await playerTwo.wallet.signMessage(hashData);

        await plOneContract.closeChannel(nonce, playerOne.wallet.address, pl1Prize, playerTwo.wallet.address, pl2Prize, signature);

        // close dispute

        let pl1PrizeDispute = 3;
        let pl2PrizeDispute = 7;
        let nonceDispute = 3;

        const hashMsgDispute = ethers.utils.solidityKeccak256(['int', 'bytes', 'int', 'bytes', 'int'], [nonceDispute, playerOne.wallet.address, pl1PrizeDispute, playerTwo.wallet.address, pl2PrizeDispute]);
        const hashDataDispute = ethers.utils.arrayify(hashMsgDispute);
        const signatureDispute = await playerOne.wallet.signMessage(hashDataDispute);

        await plTwoContract.closeChannelDispute(nonceDispute, playerOne.wallet.address, pl1PrizeDispute, playerTwo.wallet.address, pl2PrizeDispute, signatureDispute);

        // third close dispute

        let pl1PrizeDispute3 = 8;
        let pl2PrizeDispute3 = 2;
        let nonceDispute3 = 4;

        const hashMsgDispute3 = ethers.utils.solidityKeccak256(['int', 'bytes', 'int', 'bytes', 'int'], [nonceDispute3, playerOne.wallet.address, pl1PrizeDispute3, playerTwo.wallet.address, pl2PrizeDispute3]);
        const hashDataDispute3 = ethers.utils.arrayify(hashMsgDispute3);
        const signatureDispute3 = await playerTwo.wallet.signMessage(hashDataDispute3);

        await plOneContract.closeChannelDispute(nonceDispute3, playerOne.wallet.address, pl1PrizeDispute3, playerTwo.wallet.address, pl2PrizeDispute3, signatureDispute3);


        let prisePlayerOne = await plOneContract.addressToPrize(playerOne.wallet.address);
        let prisePlayerTwo = await plOneContract.addressToPrize(playerTwo.wallet.address);

        assert.strictEqual(prisePlayerOne.toNumber(), pl1PrizeDispute3);
        assert.strictEqual(prisePlayerTwo.toNumber(), pl2PrizeDispute3);

    });

    it('should set prices correctly after fourth dispute', async () => {

        // close

        let pl1Prize = 6;
        let pl2Prize = 4;
        let nonce = 2;

        const hashMsg = ethers.utils.solidityKeccak256(['int', 'bytes', 'int', 'bytes', 'int'], [nonce, playerOne.wallet.address, pl1Prize, playerTwo.wallet.address, pl2Prize]);
        const hashData = ethers.utils.arrayify(hashMsg);
        const signature = await playerTwo.wallet.signMessage(hashData);

        await plOneContract.closeChannel(nonce, playerOne.wallet.address, pl1Prize, playerTwo.wallet.address, pl2Prize, signature);

        // close dispute

        let pl1PrizeDispute = 3;
        let pl2PrizeDispute = 7;
        let nonceDispute = 3;

        const hashMsgDispute = ethers.utils.solidityKeccak256(['int', 'bytes', 'int', 'bytes', 'int'], [nonceDispute, playerOne.wallet.address, pl1PrizeDispute, playerTwo.wallet.address, pl2PrizeDispute]);
        const hashDataDispute = ethers.utils.arrayify(hashMsgDispute);
        const signatureDispute = await playerOne.wallet.signMessage(hashDataDispute);

        await plTwoContract.closeChannelDispute(nonceDispute, playerOne.wallet.address, pl1PrizeDispute, playerTwo.wallet.address, pl2PrizeDispute, signatureDispute);

        // third close dispute

        let pl1PrizeDispute3 = 8;
        let pl2PrizeDispute3 = 2;
        let nonceDispute3 = 4;

        const hashMsgDispute3 = ethers.utils.solidityKeccak256(['int', 'bytes', 'int', 'bytes', 'int'], [nonceDispute3, playerOne.wallet.address, pl1PrizeDispute3, playerTwo.wallet.address, pl2PrizeDispute3]);
        const hashDataDispute3 = ethers.utils.arrayify(hashMsgDispute3);
        const signatureDispute3 = await playerTwo.wallet.signMessage(hashDataDispute3);

        await plOneContract.closeChannelDispute(nonceDispute3, playerOne.wallet.address, pl1PrizeDispute3, playerTwo.wallet.address, pl2PrizeDispute3, signatureDispute3);

        // fourth close dispute

        let pl1PrizeDispute4 = 1;
        let pl2PrizeDispute4 = 9;
        let nonceDispute4 = 5;

        const hashMsgDispute4 = ethers.utils.solidityKeccak256(['int', 'bytes', 'int', 'bytes', 'int'], [nonceDispute4, playerOne.wallet.address, pl1PrizeDispute4, playerTwo.wallet.address, pl2PrizeDispute4]);
        const hashDataDispute4 = ethers.utils.arrayify(hashMsgDispute4);
        const signatureDispute4 = await playerOne.wallet.signMessage(hashDataDispute4);

        await plTwoContract.closeChannelDispute(nonceDispute4, playerOne.wallet.address, pl1PrizeDispute4, playerTwo.wallet.address, pl2PrizeDispute4, signatureDispute4);


        let prisePlayerOne = await plOneContract.addressToPrize(playerOne.wallet.address);
        let prisePlayerTwo = await plOneContract.addressToPrize(playerTwo.wallet.address);

        assert.strictEqual(prisePlayerOne.toNumber(), pl1PrizeDispute4);
        assert.strictEqual(prisePlayerTwo.toNumber(), pl2PrizeDispute4);

    });

    it('should set prices correctly after closing channel', async () => {

        let temp = await provider.getBalance(playerOne.wallet.address);
        console.log(temp.toString());

        let pl1Prize = 6;
        let pl2Prize = 4;
        let nonce = 2;

        const hashMsg = ethers.utils.solidityKeccak256(['int', 'bytes', 'int', 'bytes', 'int'], [nonce, playerOne.wallet.address, pl1Prize, playerTwo.wallet.address, pl2Prize]);
        const hashData = ethers.utils.arrayify(hashMsg);
        const signature = await playerTwo.wallet.signMessage(hashData);

        await plOneContract.closeChannel(nonce, playerOne.wallet.address, pl1Prize, playerTwo.wallet.address, pl2Prize, signature);

        let prisePlayerOne = await plOneContract.addressToPrize(playerOne.wallet.address);
        let prisePlayerTwo = await plOneContract.addressToPrize(playerTwo.wallet.address);

        assert.strictEqual(prisePlayerOne.toNumber(), pl1Prize);
        assert.strictEqual(prisePlayerTwo.toNumber(), pl2Prize);

        await utils.timeTravel(deployer.provider, 100);

        await plOneContract.payPrizes();

        temp = await provider.getBalance(playerOne.wallet.address);
        console.log(temp.toString());

    });

});