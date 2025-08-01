/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useReadContract,
  useWriteContract,
  usePublicClient,
} from "wagmi";
import { ABI_CONFIG } from "@/components/config/abi_config";

export function useNFTMarketplace() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // Listing Functions
  const listSingleNFT = async (nftContract: string, tokenId: number, price: number) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.marketPlace.address as `0x${string}`,
        abi: ABI_CONFIG.marketPlace.abi,
        functionName: "listSingleNFT",
        args: [nftContract, tokenId, price],
      });
    
      console.log("Txhash:", hash);
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      console.log("Trạng thái:", receipt?.status === "success" ? "Thành công" : "Thất bại");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi:", error.message);
      throw error;
    }
  };

  const listCollectionBundle = async (nftContract: string, tokenIds: number[], bundlePrice: number, collectionName: string) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.marketPlace.address as `0x${string}`,
        abi: ABI_CONFIG.marketPlace.abi,
        functionName: "listCollectionBundle",
        args: [nftContract, tokenIds, bundlePrice, collectionName],
      });
      
      console.log("Txhash:", hash);
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      console.log("Trạng thái:", receipt?.status === "success" ? "Thành công" : "Thất bại");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi:", error.message);
      throw error;
    }
  };

  const listCollectionIndividual = async (nftContract: string, tokenIds: number[], prices: number[], collectionName: string) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.marketPlace.address as `0x${string}`,
        abi: ABI_CONFIG.marketPlace.abi,
        functionName: "listCollectionIndividual",
        args: [nftContract, tokenIds, prices, collectionName],
      });
      
      console.log("Txhash:", hash);
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      console.log("Trạng thái:", receipt?.status === "success" ? "Thành công" : "Thất bại");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi:", error.message);
      throw error;
    }
  };

  const listCollectionSamePrice = async (nftContract: string, tokenIds: number[], pricePerItem: number, collectionName: string) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.marketPlace.address as `0x${string}`,
        abi: ABI_CONFIG.marketPlace.abi,
        functionName: "listCollectionSamePrice",
        args: [nftContract, tokenIds, pricePerItem, collectionName],
      });
      
      console.log("Txhash:", hash);
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      console.log("Trạng thái:", receipt?.status === "success" ? "Thành công" : "Thất bại");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi:", error.message);
      throw error;
    }
  };

  // Buying Functions
  const buyNFT = async (listingId: number, value: number) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.marketPlace.address as `0x${string}`,
        abi: ABI_CONFIG.marketPlace.abi,
        functionName: "buyNFT",
        args: [listingId],
        value: BigInt(value),
      });
      
      console.log("Txhash:", hash);
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      console.log("Trạng thái:", receipt?.status === "success" ? "Thành công" : "Thất bại");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi:", error.message);
      throw error;
    }
  };

  const buyCollectionBundle = async (collectionId: number, value: number) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.marketPlace.address as `0x${string}`,
        abi: ABI_CONFIG.marketPlace.abi,
        functionName: "buyCollectionBundle",
        args: [collectionId],
        value: BigInt(value),
      });
      
      console.log("Txhash:", hash);
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      console.log("Trạng thái:", receipt?.status === "success" ? "Thành công" : "Thất bại");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi:", error.message);
      throw error;
    }
  };

  const buyNFTUnified = async (id: number, value: number) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.marketPlace.address as `0x${string}`,
        abi: ABI_CONFIG.marketPlace.abi,
        functionName: "buyNFTUnified",
        args: [id],
        value: BigInt(value),
      });
      
      console.log("Txhash:", hash);
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      console.log("Trạng thái:", receipt?.status === "success" ? "Thành công" : "Thất bại");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi:", error.message);
      throw error;
    }
  };

  // Cancel Functions
  const cancelListing = async (listingId: number) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.marketPlace.address as `0x${string}`,
        abi: ABI_CONFIG.marketPlace.abi,
        functionName: "cancelListing",
        args: [listingId],
      });
      
      console.log("Txhash:", hash);
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      console.log("Trạng thái:", receipt?.status === "success" ? "Thành công" : "Thất bại");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi:", error.message);
      throw error;
    }
  };

  const cancelCollection = async (collectionId: number) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.marketPlace.address as `0x${string}`,
        abi: ABI_CONFIG.marketPlace.abi,
        functionName: "cancelCollection",
        args: [collectionId],
      });
      
      console.log("Txhash:", hash);
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      console.log("Trạng thái:", receipt?.status === "success" ? "Thành công" : "Thất bại");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi:", error.message);
      throw error;
    }
  };

  const cancelListingUnified = async (id: number) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.marketPlace.address as `0x${string}`,
        abi: ABI_CONFIG.marketPlace.abi,
        functionName: "cancelListingUnified",
        args: [id],
      });
      
      console.log("Txhash:", hash);
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      console.log("Trạng thái:", receipt?.status === "success" ? "Thành công" : "Thất bại");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi:", error.message);
      throw error;
    }
  };

  // Update Price Functions
  const updatePrice = async (listingId: number, newPrice: number) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.marketPlace.address as `0x${string}`,
        abi: ABI_CONFIG.marketPlace.abi,
        functionName: "updatePrice",
        args: [listingId, newPrice],
      });
      
      console.log("Txhash:", hash);
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      console.log("Trạng thái:", receipt?.status === "success" ? "Thành công" : "Thất bại");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi:", error.message);
      throw error;
    }
  };

  const updateBundlePrice = async (collectionId: number, newBundlePrice: number) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.marketPlace.address as `0x${string}`,
        abi: ABI_CONFIG.marketPlace.abi,
        functionName: "updateBundlePrice",
        args: [collectionId, newBundlePrice],
      });
      
      console.log("Txhash:", hash);
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      console.log("Trạng thái:", receipt?.status === "success" ? "Thành công" : "Thất bại");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi:", error.message);
      throw error;
    }
  };

  // Read Functions
  const getListing = (listingId: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "getListing",
      args: [listingId],
      query: { enabled: listingId > 0 },
    });
    return data;
  };

  const getCollection = (collectionId: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "getCollection",
      args: [collectionId],
      query: { enabled: collectionId > 0 },
    });
    return data;
  };

  const getActiveListings = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "getActiveListings",
    });
    return data;
  };

  const getActiveCollections = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "getActiveCollections",
    });
    return data;
  };

  // Fixed function name
  const getMarketplaceStats = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "getMarketplaceStats",
    });
    return data;
  };

  const getSellerListings = (seller: string) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "getSellerListings",
      args: [seller],
      query: { enabled: !!seller },
    });
    return data;
  };

  const getSellerCollections = (seller: string) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "getSellerCollections",
      args: [seller],
      query: { enabled: !!seller },
    });
    return data;
  };

  const isTokenListed = (nftContract: string, tokenId: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "isTokenListed",
      args: [nftContract, tokenId],
      query: { enabled: !!nftContract && tokenId >= 0 },
    });
    return data;
  };

  const getListingInfo = (id: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "getListingInfo",
      args: [id],
      query: { enabled: id >= 0 },
    });
    return data;
  };

  // Additional Read Functions from ABI
  const getActiveListingsPaginated = (offset: number, limit: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "getActiveListingsPaginated",
      args: [offset, limit],
      query: { enabled: offset >= 0 && limit > 0 },
    });
    return data;
  };

  const getAllAvailableNFTs = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "getAllAvailableNFTs",
    });
    return data;
  };

  const getBundleCollections = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "getBundleCollections",
    });
    return data;
  };

  const getCollectionItems = (collectionId: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "getCollectionItems",
      args: [collectionId],
      query: { enabled: collectionId >= 0 },
    });
    return data;
  };

  const getFeesBalance = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "getFeesBalance",
    });
    return data;
  };

  const getIndividualCollections = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "getIndividualCollections",
    });
    return data;
  };

  const getRealCollectionId = (specialId: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "getRealCollectionId",
      args: [specialId],
      query: { enabled: specialId >= 0 },
    });
    return data;
  };

  const getTotalCollections = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "getTotalCollections",
    });
    return data;
  };

  const getTotalListings = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "getTotalListings",
    });
    return data;
  };

  const isBundleCollectionId = (id: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "isBundleCollectionId",
      args: [id],
      query: { enabled: id >= 0 },
    });
    return data;
  };

  const getMarketplaceFee = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "marketplaceFee",
    });
    return data;
  };

  const getPaused = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "paused",
    });
    return data;
  };

  const getMaxCollectionSize = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "MAX_COLLECTION_SIZE",
    });
    return data;
  };

  const getMaxFee = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "MAX_FEE",
    });
    return data;
  };

  // Direct access to mappings
  const getListingDirect = (listingId: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "listings",
      args: [listingId],
      query: { enabled: listingId >= 0 },
    });
    return data;
  };

  const getCollectionListingDirect = (collectionId: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "collectionListings",
      args: [collectionId],
      query: { enabled: collectionId >= 0 },
    });
    return data;
  };

  const getSellerListingsByIndex = (seller: string, index: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "sellerListings",
      args: [seller, index],
      query: { enabled: !!seller && index >= 0 },
    });
    return data;
  };

  const getSellerCollectionsByIndex = (seller: string, index: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "sellerCollections",
      args: [seller, index],
      query: { enabled: !!seller && index >= 0 },
    });
    return data;
  };

  const getTokenToListingId = (nftContract: string, tokenId: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.marketPlace.address as `0x${string}`,
      abi: ABI_CONFIG.marketPlace.abi,
      functionName: "tokenToListingId",
      args: [nftContract, tokenId],
      query: { enabled: !!nftContract && tokenId >= 0 },
    });
    return data;
  };

  return {
    // Write functions
    listSingleNFT,
    listCollectionBundle,
    listCollectionIndividual,
    listCollectionSamePrice,
    buyNFT,
    buyCollectionBundle,
    buyNFTUnified,
    cancelListing,
    cancelCollection,
    cancelListingUnified,
    updatePrice,
    updateBundlePrice,

    // Read functions
    getListing,
    getCollection,
    getActiveListings,
    getActiveCollections,
    getMarketplaceStats, // Fixed name
    getSellerListings,
    getSellerCollections,
    isTokenListed,
    getListingInfo,

    // Additional read functions
    getActiveListingsPaginated,
    getAllAvailableNFTs,
    getBundleCollections,
    getCollectionItems,
    getFeesBalance,
    getIndividualCollections,
    getRealCollectionId,
    getTotalCollections,
    getTotalListings,
    isBundleCollectionId,
    getMarketplaceFee,
    getPaused,
    getMaxCollectionSize,
    getMaxFee,

    // Direct mapping access
    getListingDirect,
    getCollectionListingDirect,
    getSellerListingsByIndex,
    getSellerCollectionsByIndex,
    getTokenToListingId,
  };
}