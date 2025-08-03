const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Check deployer balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy the DocumentVerification contract
  console.log("\nDeploying DocumentVerification contract...");
  const DocumentVerification = await ethers.getContractFactory("DocumentVerification");
  
  // Estimate gas for deployment
  const deploymentData = DocumentVerification.interface.encodeDeploy([]);
  const estimatedGas = await deployer.estimateGas({ data: deploymentData });
  console.log("Estimated gas for deployment:", estimatedGas.toString());

  // Deploy the contract
  const documentVerification = await DocumentVerification.deploy();
  await documentVerification.waitForDeployment();

  const contractAddress = await documentVerification.getAddress();
  console.log("DocumentVerification deployed to:", contractAddress);

  // Verify deployment
  console.log("\nVerifying deployment...");
  const code = await deployer.provider.getCode(contractAddress);
  if (code === "0x") {
    throw new Error("Contract deployment failed - no code at address");
  }
  console.log("✅ Contract successfully deployed and verified");

  // Save deployment information
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await deployer.provider.getBlockNumber(),
    gasUsed: estimatedGas.toString(),
    contractName: "DocumentVerification",
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentFile}`);

  // Update environment variables file
  const envFile = path.join(__dirname, "..", ".env.local");
  let envContent = "";
  
  if (fs.existsSync(envFile)) {
    envContent = fs.readFileSync(envFile, "utf8");
  }

  // Update or add contract address
  const contractAddressLine = `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`;
  const networkIdLine = `NEXT_PUBLIC_NETWORK_ID=${await deployer.provider.getNetwork().then(n => n.chainId)}`;
  const networkNameLine = `NEXT_PUBLIC_NETWORK_NAME=${hre.network.name}`;

  // Remove existing lines if they exist
  envContent = envContent.replace(/^NEXT_PUBLIC_CONTRACT_ADDRESS=.*$/m, "");
  envContent = envContent.replace(/^NEXT_PUBLIC_NETWORK_ID=.*$/m, "");
  envContent = envContent.replace(/^NEXT_PUBLIC_NETWORK_NAME=.*$/m, "");

  // Add new lines
  envContent += `\n${contractAddressLine}\n${networkIdLine}\n${networkNameLine}\n`;

  fs.writeFileSync(envFile, envContent);
  console.log("✅ Environment variables updated");

  // Test the deployed contract
  console.log("\nTesting deployed contract...");
  try {
    // Test storing a document
    const testHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
    const testMetadata = JSON.stringify({
      title: "Test Certificate",
      issuer: "Test University",
      category: "academic"
    });
    
    const tx = await documentVerification.storeDocument(
      testHash,
      testMetadata,
      deployer.address
    );
    await tx.wait();
    console.log("✅ Test document stored successfully");

    // Test verifying the document
    const verification = await documentVerification.verifyDocument(testHash);
    console.log("✅ Test document verified:", verification[0]); // exists
    
  } catch (error) {
    console.error("❌ Contract testing failed:", error.message);
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Summary:");
  console.log(`   Network: ${hre.network.name}`);
  console.log(`   Contract Address: ${contractAddress}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Gas Used: ${estimatedGas.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
