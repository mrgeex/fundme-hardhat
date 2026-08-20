import hre from "hardhat";
const { ethers, getNamedAccounts } = hre;

async function main() {
  const { deployer } = await getNamedAccounts();
  const contract = await ethers.getContract("FundMe", deployer);

  console.log(`Funding...`);
  const fundTrx = await contract.fund({ value: ethers.parseEther("10") });
  await fundTrx.wait(1);
  console.log("Funded!");
}

try {
  await main();
  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(1);
}
