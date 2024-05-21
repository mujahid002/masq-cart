const { ethers, upgrades, run } = require("hardhat");

const main = async () => {
  // MQart Token
  const mQart = await hre.ethers.getContractFactory("MQart");
  console.log("Deploying MQart Contract...");
  const MQart = await mQart.deploy({ gasPrice: 5000000000 });
  await MQart.waitForDeployment();
  const MQartAddress = await MQart.getAddress();
  console.log("MQart Contract Address:", MQartAddress);
  console.log("----------------------------------------------------------");

  // Verify MQart Contract
  console.log("Verifying MQart...");
  await run("verify:verify", {
    address: MQartAddress,
  });
  console.log("----------------------------------------------------------");
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// CLI commands to deploy and verify MQart
// yarn hardhat run scripts/deploy.js --network polygonAmoy

// if not verified properly use this:
// yarn hardhat verify --network polygonAmoy DEPLOYED_CONTRACT_ADDRESS
