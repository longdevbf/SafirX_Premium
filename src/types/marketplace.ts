/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DatabaseListing {
  id: number
  listing_id: number
  nft_contract_address: string
  seller_address: string
  token_ids: string[]
  price: string
  listing_type: 'single' | 'bundle'
  collection_name: string | null
  image_url: string | null
  description: string | null
  name: string | null
  created_at: string
  nft_individual: NFTIndividual[]
}

export interface NFTIndividual {
  token_id: string
  metadata: {
    id: string
    name: string
    image: string
    owner: string
    token: {
      name: string
      type: string
      symbol: string
      decimals: number
      is_verified: boolean
      num_holders: number
      total_supply: string
      contract_addr: string
      num_transfers: number
      eth_contract_addr: string
    }
    metadata: {
      name: string
      image: string
      attributes: any[]
      properties: {
        edition: number
        collection: string
        total_supply: number
        sensitive_content: boolean
      }
      description: string
      external_url: string
    }
    owner_eth: string
    description: string
    metadata_uri: string
    num_transfers: number
    metadata_accessed: string
  }
}

export interface MarketplaceNFT {
  id: string
  name: string
  collection: string
  image: string
  price: string
  usdPrice: string
  lastSale: string | null
  timeLeft: string | null
  isAuction: boolean
  views: number
  likes: number
  verified: boolean
  rarity: string
  listing_type: 'single' | 'bundle'
  seller_address: string
  nft_contract_address: string
  created_at: string
  bundle_count?: number
  views_count?: number
  love_count?: number
}