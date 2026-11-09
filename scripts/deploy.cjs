const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log("=========================================");
  console.log("Deploying ServiceLog to network:", network.name, `(Chain ID: ${network.chainId})`);
  console.log("Deployer address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "BOT / ETH");
  console.log("=========================================");

  const ServiceLog = await hre.ethers.getContractFactory("ServiceLog");
  const serviceLog = await ServiceLog.deploy();
  await serviceLog.waitForDeployment();

  const contractAddress = await serviceLog.getAddress();
  console.log(">>> ServiceLog deployed successfully at:", contractAddress);

  // Save deployed address and ABI to src/contracts for frontend consumption
  const frontendDir = path.join(__dirname, "..", "src", "contracts");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  const contractArtifact = await hre.artifacts.readArtifact("ServiceLog");

  const deploymentInfo = {
    address: contractAddress,
    chainId: Number(network.chainId),
    networkName: network.name,
    deployedAt: new Date().toISOString(),
    abi: contractArtifact.abi,
  };

  fs.writeFileSync(
    path.join(frontendDir, "deployedContract.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Frontend contract metadata written to src/contracts/deployedContract.json");
  console.log("=========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

