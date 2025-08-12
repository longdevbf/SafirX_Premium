import { ethers } from "hardhat";

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    //("Deploying contracts with the account:", deployer.address);

    const SealedBidAuction = await ethers.getContractFactory("SealedBidAuction");
    const utils = await SealedBidAuction.deploy(deployer.address);
    await utils.waitForDeployment();
    console.log("SealedBidAuction deployed to:", await utils.getAddress());

    // const Marketplace = await ethers.getContractFactory("NFTMarket");
    // const marketplace = await Marketplace.deploy(deployer.address);
    // await marketplace.waitForDeployment();
    // console.log("NFTMarket deployed to:", await marketplace.getAddress());

    // const Mint = await ethers.getContractFactory("NFT");
    // const mint = await Mint.deploy(deployer.address);
    // await mint.waitForDeployment();
    // console.log("Mint deployed to:", await mint.getAddress());
  } catch (error) {
    //("Error during deployment:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    //("Deployment failed:", error);
    process.exit(1);
  });


//npx hardhat verify --network sapphire 0x1cef9a1061Fb23c3304b1bDDc6209e9b27995Ba2 0x73100Ae36Bd127C71139403F4C965Eab981EA329  

/*
SealedBidAuction deployed to: 0x4CfF0a874Cf85b7987F24832c987317496AC8856
NFTMarket deployed to: 0xffCc99eDb27F8339C5f21d57227025a808A15020
Mint deployed to: 0x1cef9a1061Fb23c3304b1bDDc6209e9b27995Ba2
*/ 