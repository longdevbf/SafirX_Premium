import { ethers } from "hardhat";

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const SealedBidAuction = await ethers.getContractFactory("SealedBidAuction");
    const utils = await SealedBidAuction.deploy(deployer.address);
    await utils.waitForDeployment();
    console.log("SealedBidAuction deployed to:", await utils.getAddress());

    const Marketplace = await ethers.getContractFactory("NFTMarket");
    const marketplace = await Marketplace.deploy(deployer.address);
    await marketplace.waitForDeployment();
    console.log("NFTMarket deployed to:", await marketplace.getAddress());

    const Mint = await ethers.getContractFactory("NFT");
    const mint = await Mint.deploy(deployer.address);
    await mint.waitForDeployment();
    console.log("Mint deployed to:", await mint.getAddress());
  } catch (error) {
    console.error("Error during deployment:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });

/*
The address contract deployed below:
- SealedBidAuction:0xC6b5b863FaaEf7fb0e41889D237a910EA81D15E9
- NFTMarket:0xAcA4a7Eed013E4b890077d8006fDb0B46e24A932
- NFT:0x1fE3d65eBDB75272bD1dfaA4bD21e523Dd84ccF3
*/
//0x5f3e20d0F39b02CC51EE449ce733d8C3b4FAAb1A