// /* eslint-disable @typescript-eslint/no-explicit-any */
// import {ethers} from 'hardhat';
// import * as sapphire from '@oasisprotocol/sapphire-paratime';
// const TestArtifact = require("../../artifacts/contracts/test.sol/Test.json");

// async function TestSuccessful(contractAddr: string, wallet: any){
//     const experiment = await ethers.getContractAt(TestArtifact.abi, contractAddr, wallet);
//     const rs = await experiment.test(5);
//     try{
//         const receipt = await rs.wait();
//         //("Transaction successful with hash:", receipt?.hash);
//     } catch (error) {
//         //("Transaction failed:", error);
//     }
    
// }

// async function main(){
//    const contractAddr = "0xd04271cB3a8af5366B1a141960545E3E29F8Aa0c";
//    const privateKey = `${process.env.PRIVATE_KEY}`;
//    const provider = new ethers.JsonRpcProvider('https://testnet.sapphire.oasis.io')
//    const wallet = new ethers.Wallet(privateKey, provider);
//    await TestSuccessful(contractAddr, wallet);
//    //await TestFailed(contractAddr);
// }
// main();
