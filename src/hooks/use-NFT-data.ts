import { useState, useEffect } from 'react';

interface NFTApiResponse {
  evm_nfts: {
    description: string;
    id: string; // Đây chính là token ID
    image: string;
    metadata: {
      attributes: Array<{
        trait_type: string;
        value: string;
      }>;
      description: string;
      image: string;
      name: string;
    };
    name: string;
    num_transfers: number;
    token: {
      is_verified: boolean;
      name: string;
      symbol: string;
      type: string;
      contract_addr: string; // Contract address ở đây
      eth_contract_addr: string; // Ethereum format contract address
    };
  }[];
  total_count: number;
}

interface ProcessedNFT {
  id: string;
  name: string;
  collection: string;
  image: string;
  isVerified: boolean;
  contractName: string;
  contractAddress: string; // Contract address
  tokenId: string; // Token ID
  transfers: number;
  edition?: string;
}

export function useNFTData(address: string | undefined) {
  const [nfts, setNFTs] = useState<ProcessedNFT[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    const fetchNFTs = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`https://nexus.oasis.io/v1/sapphire/accounts/${address}/nfts??limit=100&offset=0`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch NFTs');
        }

        const data: NFTApiResponse = await response.json();
        //('API Response:', data);
        
        // Chuyển đổi dữ liệu API thành format phù hợp
        const processedNFTs: ProcessedNFT[] = data.evm_nfts.map((nft) => {
          // Tìm collection từ attributes
          const collectionAttr = nft.metadata?.attributes?.find(attr => attr.trait_type === 'Collection');
          const editionAttr = nft.metadata?.attributes?.find(attr => attr.trait_type === 'Edition');
          
          return {
            id: nft.id,
            name: nft.name || 'Unnamed NFT',
            collection: collectionAttr?.value || nft.token.name || 'Unknown Collection',
            image: nft.image,
            isVerified: nft.token.is_verified,
            contractName: nft.token.name,
            contractAddress: nft.token.eth_contract_addr, // Lấy contract address từ token.contract_addr
            tokenId: nft.id, // Token ID chính là field id
            transfers: nft.num_transfers,
            edition: editionAttr?.value
          };
        });

        //('Processed NFTs:', processedNFTs);
        setNFTs(processedNFTs);
        setTotalCount(data.total_count);
      } catch (err) {
        //('Fetch NFTs error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setNFTs([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, [address]);

  return { nfts, totalCount, isLoading, error };
}