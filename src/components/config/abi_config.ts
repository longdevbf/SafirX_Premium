import * as NFTMarketPlace from '../../../contract/safirX_contract/artifacts/contracts/marketPlace.sol/NFTMarket.json';
import * as SealedBidAuction from '../../../contract/safirX_contract/artifacts/contracts/sealedBidAuction.sol/SealedBidAuction.json';
import * as mintNFT from '../../../contract/safirX_contract/artifacts/contracts/mintNFT.sol/NFT.json';

export const ABI_CONFIG = {
  marketPlace: {
    address: '0xAcA4a7Eed013E4b890077d8006fDb0B46e24A932',
    abi: NFTMarketPlace.abi,
  },
  sealedBidAuction: {
    address: '0x5f3e20d0F39b02CC51EE449ce733d8C3b4FAAb1A',
    abi: SealedBidAuction.abi
  },
  mintNFT: {
    address: '0x1fE3d65eBDB75272bD1dfaA4bD21e523Dd84ccF3',
    abi: mintNFT.abi
  }

}