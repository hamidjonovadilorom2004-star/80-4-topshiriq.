const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploy qilayotgan account:", deployer.address);

  const Contract = await hre.ethers.getContractFactory("NFTVoteHub");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("NFTVoteHub kontrakti deploy bo'ldi:", address);
  console.log("Frontend uchun `frontend/config.js` ichiga shu manzilni qo'ying.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
