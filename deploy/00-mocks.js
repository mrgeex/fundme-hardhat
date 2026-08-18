const { network } = require("hardhat");
const {
  devChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (devChains.includes(network.name)) {
    log("-------------------------------");
    log(`Local network detected! --${network.name}-- Deploying mocks...\n`);
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      args: [DECIMALS, INITIAL_ANSWER],
      log: true,
    });
    log("\nMocks Deployed!");
    log("---------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
