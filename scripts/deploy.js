const hre = require("hardhat");

async function main() {
  console.log("Deploying Lottery contract...");
  const Lottery = await ethers.getContractFactory("Lottery");


  const lottery = await Lottery.deploy();
  console.log(lottery);
  await lottery.deployed(); 

  console.log(`Lottery deployed to: ${lottery.address}`);

}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
