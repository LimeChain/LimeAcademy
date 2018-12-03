const etherlime = require('etherlime');
const ECTools = require('../build/ECTools.json');
const MetaBatchProxy = require('../build/MetaBatchProxy.json');
const MetaToken = require('../build/MetaToken.json');
const Billboard = require('../build/Billboard.json');
const ethers = require('ethers');
const utils = ethers.utils;

describe('Example', () => {
    let deployer;
    let wallet;
    let MetaTokenContract;
    let ECToolsContract;
    let MetaBatchContract;
    let BillboardContract;
    let approveData;
    let approveDataSignature;
    let buySloganData;
    let buySloganDataSignature;

    before(async () => {

        deployer = new etherlime.EtherlimeGanacheDeployer();
        wallet = deployer.wallet;

        // Deploying contracts
        MetaTokenContract = await deployer.deploy(MetaToken);
        ECToolsContract = await deployer.deploy(ECTools);
        MetaBatchContract = await deployer.deploy(MetaBatchProxy, { ECTools: ECToolsContract.contractAddress }, wallet.address)
        BillboardContract = await deployer.deploy(Billboard, {}, MetaTokenContract.contractAddress);

        // Mint tokens
        const tx = await MetaTokenContract.contract.mint(MetaBatchContract.contractAddress, 10000);
        await MetaTokenContract.verboseWaitForTransaction(tx, 'Minting Transaction');

        // Generate approve meta transaction 
        approveData = MetaTokenContract.contract.interface.functions.approve.encode([BillboardContract.contractAddress, 100]);

        const approveHash = utils.solidityKeccak256(['address', 'uint256', 'bytes'], [MetaTokenContract.contractAddress, 0, utils.arrayify(approveData)]);
        const hashData = ethers.utils.arrayify(approveHash);
        approveDataSignature = await wallet.signMessage(hashData);

        // Generate buy meta transaction
        buySloganData = BillboardContract.contract.interface.functions.buy.encode(['Ogi Majstor', 100]);

        const buySloganHash = utils.solidityKeccak256(['address', 'uint256', 'bytes'], [BillboardContract.contractAddress, 0, utils.arrayify(buySloganData)]);
        const hashData2 = ethers.utils.arrayify(buySloganHash);
        buySloganDataSignature = await wallet.signMessage(hashData2);

    });

    it('Execute successful transaction', async () => {
        // Execute batched transactions
        const succesfulExecute = await MetaBatchContract.contract.execute([MetaTokenContract.contractAddress, BillboardContract.contractAddress], [0, 0], [approveData, buySloganData], [approveDataSignature, buySloganDataSignature], {
            gasLimit: 4700000,
            gasPrice: utils.bigNumberify("20000000000")
        });
        await MetaBatchContract.verboseWaitForTransaction(succesfulExecute, 'Successful Execution');


        const identityBalance = await MetaTokenContract.contract.balanceOf(MetaBatchContract.contractAddress);
        assert(identityBalance.eq(9900), 'The identity balance was not correctly lowered to 9900');

        const billboardBalance = await MetaTokenContract.contract.balanceOf(BillboardContract.contractAddress);
        assert(billboardBalance.eq(100), 'The Billboard balance should be 100');

        const billboardAllowance = await MetaTokenContract.contract.allowance(MetaBatchContract.contractAddress, BillboardContract.contractAddress);
        assert(billboardAllowance.eq(0), 'The Billboard has an allowance, but it should not');

    });

    it('Should fail and revert everything on failing second transaction', async () => {
        await assert.revert(MetaBatchContract.contract.execute([MetaTokenContract.contractAddress, BillboardContract.contractAddress], [0, 0], [approveData, buySloganData], [approveDataSignature, buySloganDataSignature], {
            gasLimit: 4700000,
            gasPrice: utils.bigNumberify("20000000000")
        }));

        const identityBalance = await MetaTokenContract.contract.balanceOf(MetaBatchContract.contractAddress);
        assert(identityBalance.eq(9900), 'The identity balance was not correctly lowered to 9900');

        const billboardBalance = await MetaTokenContract.contract.balanceOf(BillboardContract.contractAddress);
        assert(billboardBalance.eq(100), 'The Billboard balance should be 100');

        const billboardAllowance = await MetaTokenContract.contract.allowance(MetaBatchContract.contractAddress, BillboardContract.contractAddress);
        assert(billboardAllowance.eq(0), 'The Billboard has an allowance, but it should not');

    })

    describe('Relayer', () => {
        before(async () => {
            // Approve
            approveData = MetaTokenContract.contract.interface.functions.approve
                .encode([BillboardContract.contractAddress, 200]);

            const approveHash = utils.solidityKeccak256(
                ['address', 'uint256', 'bytes'],
                [MetaTokenContract.contractAddress, 0, approveData]
            );

            approveSignature = await wallet.signMessage(utils.arrayify(approveHash));

            // Buy
            buySloganData = BillboardContract.contract.interface.functions.buy
                .encode(["Majstor e Ogi", 200]);

            const buyHash = utils.solidityKeccak256(
                ['address', 'uint256', 'bytes'],
                [BillboardContract.contractAddress, 0, buySloganData]);

            buySloganDataSignature = await wallet.signMessage(utils.arrayify(buyHash));
        });

        it('Should succeed through relayer', async () => {

            const relayerWallet = accounts[3].wallet.connect(deployer.provider);
            const RelayerMetaBatchContract = MetaBatchContract.contract.connect(relayerWallet);

            await RelayerMetaBatchContract.execute(
                [MetaTokenContract.contractAddress, BillboardContract.contractAddress],
                [0, 0],
                [approveData, buySloganData],
                [approveSignature, buySloganDataSignature],
                {
                    gasLimit: 4700000
                }
            )

            const proxyBalance = await MetaTokenContract.contract
                .balanceOf(MetaBatchContract.contractAddress);

            assert(proxyBalance.eq(9700),
                'The balance of the proxy was not correctly lowered');

            const billboardBalance = await MetaTokenContract.contract
                .balanceOf(BillboardContract.contractAddress);

            assert(billboardBalance.eq(300),
                'The balance of the billboard is not correct');

            const billboardAllowance = await MetaTokenContract.contract
                .allowance(MetaBatchContract.contractAddress, BillboardContract.contractAddress);

            assert(billboardAllowance.eq(0),
                'Incorrect allowance to the Billboard contract');

        })
    })
});