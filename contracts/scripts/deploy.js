const hre = require("hardhat");

async function main() {
  const initialMerkleRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const AuditRegistry = await hre.ethers.getContractFactory("AuditRegistry");
  const registry = await AuditRegistry.deploy(initialMerkleRoot);

  await registry.waitForDeployment();
  console.log(`AuditRegistry deployed to: ${await registry.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
