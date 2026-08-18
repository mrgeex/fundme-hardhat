// const { run } = require("hardhat");
import hre from "hardhat";
const { run } = hre;

async function verify(contractAddress, args) {
  try {
    console.log("\nVerifying contracts...");
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified"))
      console.log("Already Verified!");
    else console.log(e);
  }
}

export { verify };
