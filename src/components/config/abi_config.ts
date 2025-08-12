import * as NFTMarketPlace from '../../../contract/safirX_contract/artifacts/contracts/marketPlace.sol/NFTMarket.json';
import * as SealedBidAuction from '../../../contract/safirX_contract/artifacts/contracts/sealedBidAuction.sol/SealedBidAuction.json';
import * as mintNFT from '../../../contract/safirX_contract/artifacts/contracts/mintNFT.sol/NFT.json';

export const ABI_CONFIG = {
  marketPlace: {
    address: '0xffCc99eDb27F8339C5f21d57227025a808A15020',
    abi: NFTMarketPlace.abi,
  },
  sealedBidAuction: {
    address: '0x4CfF0a874Cf85b7987F24832c987317496AC8856',
    abi: SealedBidAuction.abi
  },
  mintNFT: {
    address: '0x1cef9a1061Fb23c3304b1bDDc6209e9b27995Ba2',
    abi: mintNFT.abi
  }

}