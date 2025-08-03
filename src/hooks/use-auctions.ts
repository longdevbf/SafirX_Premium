/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useReadContract,
  useWriteContract,
  usePublicClient,
} from "wagmi";
import { ABI_CONFIG } from "@/components/config/abi_config";

export function useSealedBidAuction() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // Create Auction Functions
  const createSingleNFTAuction = async (
    nftContract: string,
    tokenId: number,
    startingPrice: number,
    reservePrice: number,
    minBidIncrement: number,
    duration: number,
    title: string,
    description: string
  ) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
        abi: ABI_CONFIG.sealedBidAuction.abi,
        functionName: "createSingleNFTAuction",
        args: [nftContract, tokenId, startingPrice, reservePrice, minBidIncrement, duration, title, description],
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

  const createCollectionAuction = async (
    nftContract: string,
    tokenIds: number[],
    startingPrice: number,
    reservePrice: number,
    minBidIncrement: number,
    duration: number,
    title: string,
    description: string
  ) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
        abi: ABI_CONFIG.sealedBidAuction.abi,
        functionName: "createCollectionAuction",
        args: [nftContract, tokenIds, startingPrice, reservePrice, minBidIncrement, duration, title, description],
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

  // Bidding Functions
  const placeBid = async (auctionId: number, bidAmount: number, deposit: number) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
        abi: ABI_CONFIG.sealedBidAuction.abi,
        functionName: "placeBid",
        args: [auctionId, bidAmount],
        value: BigInt(deposit),
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

  // Auction Management Functions
  const finalizeAuction = async (auctionId: number) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
        abi: ABI_CONFIG.sealedBidAuction.abi,
        functionName: "finalizeAuction",
        args: [auctionId],
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

  const cancelAuction = async (auctionId: number) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
        abi: ABI_CONFIG.sealedBidAuction.abi,
        functionName: "cancelAuction",
        args: [auctionId],
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

  const claimNFT = async (auctionId: number, payment: number = 0) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
        abi: ABI_CONFIG.sealedBidAuction.abi,
        functionName: "claimNFT",
        args: [auctionId],
        value: BigInt(payment),
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

  const reclaimNFT = async (auctionId: number) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
        abi: ABI_CONFIG.sealedBidAuction.abi,
        functionName: "reclaimNFT",
        args: [auctionId],
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
  const getAuction = (auctionId: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
      abi: ABI_CONFIG.sealedBidAuction.abi,
      functionName: "auctions",
      args: [auctionId],
      query: { enabled: auctionId > 0 },
    });
    return data;
  };

  const getAuctionBids = (auctionId: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
      abi: ABI_CONFIG.sealedBidAuction.abi,
      functionName: "getAuctionBids",
      args: [auctionId],
      query: { enabled: auctionId > 0 },
    });
    return data;
  };

  const getUserAuctions = (user: string, index: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
      abi: ABI_CONFIG.sealedBidAuction.abi,
      functionName: "userAuctions",
      args: [user, index],
      query: { enabled: !!user && index >= 0 },
    });
    return data;
  };

  const getUserBids = (user: string, index: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
      abi: ABI_CONFIG.sealedBidAuction.abi,
      functionName: "userBids",
      args: [user, index],
      query: { enabled: !!user && index >= 0 },
    });
    return data;
  };

  const getAuctionDeposits = (auctionId: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
      abi: ABI_CONFIG.sealedBidAuction.abi,
      functionName: "auctionDeposits",
      args: [auctionId],
      query: { enabled: auctionId > 0 },
    });
    return data;
  };

  const getAuctionBid = (auctionId: number, bidIndex: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
      abi: ABI_CONFIG.sealedBidAuction.abi,
      functionName: "auctionBids",
      args: [auctionId, bidIndex],
      query: { enabled: auctionId > 0 && bidIndex >= 0 },
    });
    return data;
  };

  const getBidderToIndex = (auctionId: number, bidder: string) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
      abi: ABI_CONFIG.sealedBidAuction.abi,
      functionName: "bidderToIndex",
      args: [auctionId, bidder],
      query: { enabled: auctionId > 0 && !!bidder },
    });
    return data;
  };

  // Constants
  const getPlatformFee = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
      abi: ABI_CONFIG.sealedBidAuction.abi,
      functionName: "PLATFORM_FEE",
    });
    return data;
  };

  const getMinBidIncrement = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
      abi: ABI_CONFIG.sealedBidAuction.abi,
      functionName: "MIN_BID_INCREMENT",
    });
    return data;
  };

  const getMaxAuctionDuration = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
      abi: ABI_CONFIG.sealedBidAuction.abi,
      functionName: "MAX_AUCTION_DURATION",
    });
    return data;
  };

  const getMinAuctionDuration = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
      abi: ABI_CONFIG.sealedBidAuction.abi,
      functionName: "MIN_AUCTION_DURATION",
    });
    return data;
  };

  const getClaimDuration = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
      abi: ABI_CONFIG.sealedBidAuction.abi,
      functionName: "CLAIM_DURATION",
    });
    return data;
  };

  const getBidExtensionTime = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
      abi: ABI_CONFIG.sealedBidAuction.abi,
      functionName: "BID_EXTENSION_TIME",
    });
    return data;
  };

  const getMaxBidsPerAuction = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
      abi: ABI_CONFIG.sealedBidAuction.abi,
      functionName: "MAX_BIDS_PER_AUCTION",
    });
    return data;
  };

  const getMaxCollectionSize = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
      abi: ABI_CONFIG.sealedBidAuction.abi,
      functionName: "MAX_COLLECTION_SIZE",
    });
    return data;
  };

  const getMaxExtensions = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
      abi: ABI_CONFIG.sealedBidAuction.abi,
      functionName: "MAX_EXTENSIONS",
    });
    return data;
  };

  return {
    // Write functions
    createSingleNFTAuction,
    createCollectionAuction,
    placeBid,
    finalizeAuction,
    cancelAuction,
    claimNFT,
    reclaimNFT,

    // Read functions
    getAuction,
    getAuctionBids,
    getUserAuctions,
    getUserBids,
    getAuctionDeposits,
    getAuctionBid,
    getBidderToIndex,

    // Constants
    getPlatformFee,
    getMinBidIncrement,
    getMaxAuctionDuration,
    getMinAuctionDuration,
    getClaimDuration,
    getBidExtensionTime,
    getMaxBidsPerAuction,
    getMaxCollectionSize,
    getMaxExtensions,
  };
}