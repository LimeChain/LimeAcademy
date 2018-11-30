const etherlime = require('etherlime');

const MerkleUtils = require('../build/MerkleUtils.json');
const MerkleLime = require('../build/MerkleLime.json');
const ethers = require('ethers');
const utils = ethers.utils;

describe('Example', () => {
    let deployer;

    let aOriginal;
    let bOriginal;
    let cOriginal;
    let dOriginal;
    let eOriginal;
    let fOriginal;
    let gOriginal;
    let hOriginal;
    let aHash;
    let bHash;
    let cHash;
    let dHash;
    let eHash;
    let fHash;
    let gHash;
    let hHash;
    let abHash;
    let cdHash;
    let efHash;
    let ghHash;
    let abcdHash;
    let efghHash;
    let root;

    const createTree = () => {
        aOriginal = 'a;b;50';
        bOriginal = 'b;c;20';
        cOriginal = 'c;d;30';
        dOriginal = 'd;a;10';
        eOriginal = 'e;a;50';
        fOriginal = 'f;h;12';
        gOriginal = 'g;c;80';
        hOriginal = 'h;d;40';

        aHash = utils.solidityKeccak256(['bytes'], [utils.toUtf8Bytes(aOriginal)]);
        bHash = utils.solidityKeccak256(['bytes'], [utils.toUtf8Bytes(bOriginal)]);
        cHash = utils.solidityKeccak256(['bytes'], [utils.toUtf8Bytes(cOriginal)]);
        dHash = utils.solidityKeccak256(['bytes'], [utils.toUtf8Bytes(dOriginal)]);
        eHash = utils.solidityKeccak256(['bytes'], [utils.toUtf8Bytes(eOriginal)]);
        fHash = utils.solidityKeccak256(['bytes'], [utils.toUtf8Bytes(fOriginal)]);
        gHash = utils.solidityKeccak256(['bytes'], [utils.toUtf8Bytes(gOriginal)]);
        hHash = utils.solidityKeccak256(['bytes'], [utils.toUtf8Bytes(hOriginal)]);
        abHash = utils.solidityKeccak256(['bytes32', 'bytes32'], [aHash, bHash]);
        cdHash = utils.solidityKeccak256(['bytes32', 'bytes32'], [cHash, dHash]);
        efHash = utils.solidityKeccak256(['bytes32', 'bytes32'], [eHash, fHash]);
        ghHash = utils.solidityKeccak256(['bytes32', 'bytes32'], [gHash, hHash]);
        abcdHash = utils.solidityKeccak256(['bytes32', 'bytes32'], [abHash, cdHash]);
        efghHash = utils.solidityKeccak256(['bytes32', 'bytes32'], [efHash, ghHash]);

        root = utils.solidityKeccak256(['bytes32', 'bytes32'], [abcdHash, efghHash]);
    }

    before(async () => {
        deployer = new etherlime.EtherlimeGanacheDeployer();
        createTree();

        // TODO deploy utils and MerkleLime

    });

    let merkleLimeContract;

    it('should correctly discover leaf from the tree', async () => {

        assert.fail();
    });

    it('should fail on wrong leaf passed', async () => {

        assert.fail();

    });

    it('should fail on wrong intermediary hashes passed', async () => {

        assert.fail();

    });

    it('should fail on wrong index hashes passed', async () => {

        assert.fail();

    });
});