import { assert } from "chai";
import hre from "hardhat";
const { deployments, ethers, getNamedAccounts } = hre;

describe("Testing Fundme", () => {
  let fundMe, deployer, MockV3Aggregator;
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;

    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployer);
    MockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("constructor", () => {
    it("sets the correct aggregator address", () => {
      const result = await fundMe.priceFeed();
      assert.equal(result, MockV3Aggregator.address);
    });
  });
});
