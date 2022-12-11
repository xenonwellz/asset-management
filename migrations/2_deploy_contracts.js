var AssetContract = artifacts.require("./AssetContract.sol");

module.exports = function (deployer) {
  deployer.deploy(AssetContract);
};
