const { network } = require("hardhat");
const { networkConfig, devChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUsdPriceFeedAddress;
  if (devChains.includes(network.name)) {
    ethUsdPriceFeedAddress = (await deployments.get("MockV3Aggregator"))
      .address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
  });
  log("-------------------------------");
};

module.exports.tags = ["all", "fundme"];
