import hre from "hardhat";
const { network } = hre;
import {
  devChains,
  DECIMALS,
  INITIAL_ANSWER,
} from "../helper-hardhat-config.js";

async function deployMocks({ getNamedAccounts, deployments }) {
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
}

deployMocks.tags = ["all", "mocks"];

export default deployMocks;
