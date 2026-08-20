import hre from "hardhat";
import { assert } from "chai";
import { devChains } from "../../helper-hardhat-config.js";
const { network, ethers, getNamedAccounts } = hre;

devChains.includes(network.name)
  ? describe.skip
  : describe("Fundme staging", () => {
      let deployer, contract;
      const sendValue = ethers.parseEther("0.023");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        contract = await ethers.getContract("FundMe", deployer);
      });

      it("allows people to fund and withdraw", async () => {
        const fundTx = await contract.fund({ value: sendValue });
        await fundTx.wait(1);

        const withdrawTx = await contract.withdraw();
        await withdrawTx.wait(1);

        const endingContractBalance = await ethers.provider.getBalance(
          contract.target,
        );

        assert.equal(endingContractBalance.toString(), "0");
      });
    });
