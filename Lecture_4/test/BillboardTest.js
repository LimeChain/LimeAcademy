const Billboard = require('../build/Billboard.json');
const etherlime = require('etherlime');

describe('Billboard', () => {
    let owner = accounts[0];
    let notOwner = accounts[1];

    let deployer;
    let provider;
    let deployedContractWrapper;
    let contract;

    let port = 8545;
    let defaultOverrideOptions = {
        gasLimit: 4000000
    }

    const ONE_ETHER = ethers.utils.bigNumberify('1000000000000000000');

    beforeEach(async () => {
        deployer = new etherlime.EtherlimeGanacheDeployer(owner.secretKey, port, defaultOverrideOptions);
        provider = deployer.provider;
        deployedContractWrapper = await deployer.deploy(Billboard);
        contract = deployedContractWrapper.contract;
    });

    describe('initialization', () => {

        it('should initialize contract with correct values', async () => {
            let _price = await contract.price();
            let _owner = await contract.owner();
            let _billboardOwner = await contract.billboardOwner();
            let _historyLength = await contract.historyLength();
            let _slogan  = await contract.slogan();
            let _contractBalance = await provider.getBalance(contract.address);
    
            assert(_price.eq(ONE_ETHER), 'Initial price should be 1 ether');
            assert.strictEqual(_owner, owner.wallet.address, 'Initial contract owner does not match');
            assert(ethers.utils.bigNumberify(_billboardOwner).isZero(), 'Initial billboard owner should not be set');
            assert.strictEqual(_historyLength.toNumber(), 0, 'Initial history of owners should be empty');
            assert.strictEqual(_slogan, '', 'Initial slogan should be empty');
            assert(ethers.utils.bigNumberify(_contractBalance).isZero(), 'Initial contract balance should be empty');
        });

    });

    describe('setPrice', () => {

        it('should update price successfully', async () => {
            await contract.setPrice(ONE_ETHER);
            let price = await contract.price();
            assert(price.eq(ONE_ETHER), 'The price was not updated correctly');
        });
    
        it('should throw updating price with invalid value', async () => {
            assert.revert(contract.setPrice(0));
        });
    
        it('should throw if non-authorized user tries to update price', async () => {
            let _notOwnerWallet = new ethers.Wallet(notOwner.secretKey, provider);
            let _contract = new ethers.Contract(contract.address, Billboard.abi, _notOwnerWallet);
            assert.revert(_contract.setPrice(ONE_ETHER));
        });

    });

    describe('buy', () => {

        let slogan = 'sample slogan';

        it('should buy successfully', async () => {
            await contract.buy(slogan, {value: ONE_ETHER});
    
            let _billboardOwner = await contract.billboardOwner();
            let _historyLength = await contract.historyLength();
            let _slogan  = await contract.slogan();
            let _contractBalance = await provider.getBalance(contract.address);
    
            assert.strictEqual(_billboardOwner, owner.wallet.address, 'Billboard owner not updated correctly');
            assert(_historyLength.toNumber(), 1, 'History of owners not updated correctly');
            assert.strictEqual(_slogan, slogan, 'Slogan not updated correctly');

            assert(ethers.utils.bigNumberify(_contractBalance).eq(ONE_ETHER), 'Initial contract balance should be empty');
        });

        it('should buy successfully and check event', async () => {
            let tx = await contract.buy(slogan, {value: ONE_ETHER});
    
            let txReceipt = await provider.getTransactionReceipt(tx.hash);
    
            // check for event
            let isEmitted = utils.hasEvent(txReceipt, contract, 'LogBillboardBought');

            assert(isEmitted, 'Event LogBillboardBought not emitted');
    
            // parse logs
            let logs = utils.parseLogs(txReceipt, contract, 'LogBillboardBought');
    
            // check log details
            assert(ethers.utils.bigNumberify(logs.length).eq('1'));
            assert.strictEqual(logs[0].buyer, owner.wallet.address, "Buyer does not match");
            assert(ethers.utils.bigNumberify(logs[0].paied).eq(ONE_ETHER), "Paied amount ethers does not match");
            assert.strictEqual(logs[0].slogan, slogan, "Slogan does not match");
        });
    
        it('should throw if transferred ethers are not enough', async () => {
            assert.revert(contract.buy(slogan, {value: 1000}));
        });

    });

    describe('withdraw', () => {

        let slogan = 'sample slogan';

        it('should withdraw successfully', async () => {
            await contract.buy(slogan, {value: ONE_ETHER});

            let _contractBalance = await provider.getBalance(contract.address);
            assert(_contractBalance.eq(ONE_ETHER), 'Contract balance does not match before withdraw');

            await contract.withdraw(defaultOverrideOptions);

            let contractBalance = await provider.getBalance(contract.address);
            assert.strictEqual(contractBalance.toNumber(), 0, 'Contract balance does not match after withdrawal');
        });

        it('should withdraw successfully and check event', async () => {
            await contract.buy(slogan, {value: ONE_ETHER});

            let tx = await contract.withdraw(defaultOverrideOptions);
    
            let txReceipt = await provider.getTransactionReceipt(tx.hash);
    
            // check for event
            let isEmitted = utils.hasEvent(txReceipt, contract, 'LogWithdrawal');

            assert(isEmitted, 'Event LogWithdrawal not emitted');
    
            // parse logs
            let logs = utils.parseLogs(txReceipt, contract, 'LogWithdrawal');
    
            // check log details
            assert(ethers.utils.bigNumberify(logs[0].amount).eq(ONE_ETHER), "Amount does not match");
            assert(!ethers.utils.bigNumberify(logs[0].timestamp).isZero(), "Timestamp should be set");
        });
    
        it('should throw trying to withraw when balance is empty', async () => {
            assert.revert(contract.withdraw());
        });
    
        it('should throw when non-authorized user tries to withdraw', async () => {
            let _notOwnerWallet = new ethers.Wallet(notOwner.secretKey, provider);
            let _contract = new ethers.Contract(contract.address, Billboard.abi, _notOwnerWallet);
            assert.revert(_contract.withdraw()); 
        });

    });

});