/* eslint-disable @typescript-eslint/no-explicit-any */
import { MarketplaceNFT } from '@/types/marketplace';

export interface MarketplaceFilters {
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'price' | 'name' | 'listing_id';
  sortOrder?: 'ASC' | 'DESC';
  minPrice?: number;
  maxPrice?: number;
  listingType?: 'single' | 'bundle';
  search?: string;
  collection?: string;
}

export interface MarketplaceResponse {
  success: boolean;
  data: MarketplaceNFT[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
  rose_price_usd: number | null;
  error?: string;
}

// Interface for detailed NFT/Collection
export interface DetailedNFT {
  id: string;
  listing_id: number;
  name: string;
  collection: string;
  image: string;
  price: string;
  usdPrice: string | null;
  description: string;
  listing_type: 'single' | 'bundle';
  seller_address: string;
  nft_contract_address: string;
  created_at: string;
  token_ids: string[];
  nft_individual: any[];
  bundle_count?: number;
  metadata?: any;
  views_count?: number;
  love_count?: number;
}

export interface DetailedNFTResponse {
  success: boolean;
  data: DetailedNFT;
  rose_price_usd: number | null;
  error?: string;
}

export async function fetchMarketplaceListings(filters: MarketplaceFilters = {}): Promise<MarketplaceResponse> {
  const searchParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  const url = `/api/marketplace?${searchParams.toString()}`;
  
  try {
    //('🔍 Fetching marketplace data from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: MarketplaceResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch marketplace data');
    }

    //(`✅ Fetched ${data.data.length} marketplace listings`);
    return data;

  } catch (error) {
    //('❌ Error fetching marketplace listings:', error);
    throw error;
  }
}

// New function to fetch detailed NFT/Collection
export async function fetchNFTDetails(id: string): Promise<DetailedNFTResponse> {
  try {
    //('🔍 Fetching NFT details for ID:', id);
    
    const response = await fetch(`/api/marketplace/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('NFT or Collection not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DetailedNFTResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch NFT details');
    }

    //(`✅ Fetched NFT details for ${id}`);
    return data;

  } catch (error) {
    //('❌ Error fetching NFT details:', error);
    throw error;
  }
}

export async function getCollections(): Promise<string[]> {
  try {
    const response = await fetch('/api/marketplace/collections');
    const data = await response.json();
    
    if (data.success) {
      return data.collections;
    }
    
    return [];
  } catch (error) {
    //('❌ Error fetching collections:', error);
    return [];
  }
}