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
        // TODO deploy token, tools, batchProxy and Billboard


        // Mint tokens
        // TODO mint tokens to the proxy contract address


        // Generate approve meta transaction 
        // TODO generate approveData, approveHash and approveSignature


        // Generate buy meta transaction
        // TODO generate buyData, buyHash and buySignature

    });

    it('Execute successful transaction', async () => {
        // Execute batched transactions
        // TODO execute batched transaction with high gas limit


        // TODO assert that the Proxy Balance has lowered

        // TODO assert that the Billboard balance has increased

        // TODO assert that the allowance is zero

    });

    it('Should fail and revert everything on failing second transaction', async () => {

        // TODO execute it second time and assert revert

        // TODO assert the same things as above

    })

    it('Should succeed through relayer', async () => {

        // TODO generate new transactions and signatures

        // TODO send them through second wallet

        // TODO assert success and correctly updated balances

    })
});