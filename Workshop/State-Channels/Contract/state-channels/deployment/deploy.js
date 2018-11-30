const etherlime = require('etherlime');
const rsp = require('../build/RSP');
const ecTools = require('../build/ECTools.json');

const deploy = async (network, secret) => {

    const secretLoc = "0x2956B7AFA2B93C048F2281BE59A5D0ECAF247C5F82430A2209143C1E973C5B82";
    const networkLoc = "ropsten";

    let deployer = new etherlime.EtherlimeGanacheDeployer();
    // let deployer = new etherlime.InfuraPrivateKeyDeployer(secretLoc, networkLoc, 'jLCpladxNxIQQ2IbJ2Aw');

    let ecToolsInstance = await deployer.deploy(ecTools);
    await deployer.deploy(rsp, {"ECTools": ecToolsInstance.contract.address});
};

module.exports = {
	deploy
};