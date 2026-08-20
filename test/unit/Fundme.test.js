import { assert, expect } from "chai";
import hre from "hardhat";
const { deployments, ethers, getNamedAccounts } = hre;

describe("Testing Fundme", () => {
  let fundMe, deployer, MockV3Aggregator;
  const sendValue = ethers.parseEther("1.0");
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;

    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployer);
    MockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("constructor", () => {
    it("sets the correct aggregator address", async () => {
      const response = await fundMe.s_priceFeed();
      assert.equal(response, MockV3Aggregator.target);
    });
  });

  describe("fund", () => {
    it("Fails when not enough ETH is sent", async () => {
      await expect(fundMe.fund()).to.be.revertedWithCustomError(
        fundMe,
        "FundMe__NotSentEnough",
      );
    });
    it("Should update the addressToAmountFunded list", async () => {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.s_addressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });
    it("Should add funder to the funders array", async () => {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.s_funders(0);
      assert.equal(response.toString(), deployer.toString());
    });
  });

  describe("withdraw", () => {
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue });
    });

    it("Should withdraw ETH", async () => {
      const startContractBalance = await ethers.provider.getBalance(
        fundMe.target,
      );
      const startDeployerBalance = await ethers.provider.getBalance(deployer);

      const trxResponse = await fundMe.withdraw();
      const trxReceipt = await trxResponse.wait(1);
      const gasCost = trxReceipt.gasPrice * trxReceipt.gasUsed;

      const endContractBalance = await ethers.provider.getBalance(
        fundMe.target,
      );
      const endDeployerBalance = await ethers.provider.getBalance(deployer);

      assert.equal(endContractBalance.toString(), 0);
      assert.equal(
        (startContractBalance + startDeployerBalance).toString(),
        (endDeployerBalance + gasCost).toString(),
      );
    });

    it("allows us to withdraw with multiple funders", async () => {
      const accounts = await ethers.getSigners();
      await Promise.all(
        accounts
          .slice(1, 7)
          .map((funder) => fundMe.connect(funder).fund({ value: sendValue })),
      );

      const startContractBalance = await ethers.provider.getBalance(
        fundMe.target,
      );
      const startDeployerBalance = await ethers.provider.getBalance(deployer);

      const trxResponse = await fundMe.withdraw();
      const trxReceipt = await trxResponse.wait(1);
      const gasCost = trxReceipt.gasPrice * trxReceipt.gasUsed;

      const endContractBalance = await ethers.provider.getBalance(
        fundMe.target,
      );
      const endDeployerBalance = await ethers.provider.getBalance(deployer);

      assert.equal(endContractBalance.toString(), 0);
      assert.equal(
        (startContractBalance + startDeployerBalance).toString(),
        (endDeployerBalance + gasCost).toString(),
      );
      await expect(fundMe.s_funders(0)).to.be.reverted;

      const fundersAmount = await Promise.all(
        accounts
          .slice(1, 7)
          .map((funder) => fundMe.s_addressToAmountFunded(funder)),
      );
      fundersAmount.forEach((amount) => assert.equal(amount, 0));
    });

    it("Only allows owner to withdraw", async () => {
      const accounts = await ethers.getSigners();
      const attacker = await fundMe.connect(accounts[1]);

      await expect(attacker.withdraw()).to.be.revertedWithCustomError(
        fundMe,
        "FundMe__NotOwner",
      );
    });
  });
});
