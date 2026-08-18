// const { network } = require("hardhat");
// const { networkConfig, devChains } = require("../helper-hardhat-config");
import hre from "hardhat";
const { network } = hre;
import { networkConfig, devChains } from "../helper-hardhat-config.js";
import { verify } from "../utils/verify.js";

async function deployFundMe({ getNamedAccounts, deployments }) {
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
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log("-------------------------------");

  if (!devChains.includes(network.name))
    await verify(fundMe.address, [ethUsdPriceFeedAddress]);
}

deployFundMe.tags = ["all", "fundme"];
deployFundMe.dependencies = ["mocks"];

export default deployFundMe;
