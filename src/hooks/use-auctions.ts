/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  useReadContract,
  useWriteContract,
  usePublicClient,
} from "wagmi";
import { ABI_CONFIG } from "@/components/config/abi_config";
import { useNFTAuctionApproval } from "./use-approval-auction";

export function useSealedBidAuction() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { 
    checkSingleNFTApproval, 
    checkCollectionApproval, 
    approveCollection,
    setApprovalForAll,
    approveNFT
  } = useNFTAuctionApproval();

  // ✅ Move publicClient call outside of nested functions
  const client = publicClient;

  // Create Auction Functions with approval check
  const createSingleNFTAuction = async (
    nftContract: string,
    tokenId: number,
    startingPrice: number,
    reservePrice: number,
    minBidIncrement: number,
    duration: number,
    title: string,
    description: string,
    userAddress: string
  ) => {
    try {
      // Step 1: Check approval status
      const approvalCheck = await checkSingleNFTApproval(nftContract, tokenId, userAddress);
      
      if (!approvalCheck.isApproved) {
        throw new Error("NFT is not approved for auction contract. Please approve first.");
      }

      // Step 2: Create auction
      const hash = await writeContractAsync({
        address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
        abi: ABI_CONFIG.sealedBidAuction.abi,
        functionName: "createSingleNFTAuction",
        args: [nftContract, tokenId, startingPrice, reservePrice, minBidIncrement, duration, title, description],
      });
      
      console.log("Create Single NFT Auction Txhash:", hash);
      const receipt = await client?.waitForTransactionReceipt({ hash });
      console.log("Status:", receipt?.status === "success" ? "Success" : "Failed");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Create Single NFT Auction Error:", error.message);
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
    description: string,
    userAddress: string
  ) => {
    try {
      // Step 1: Check approval status for all NFTs
      const approvalCheck = await checkCollectionApproval(nftContract, tokenIds, userAddress);
      
      if (!approvalCheck.isApproved) {
        throw new Error("NFTs are not approved for auction contract. Please approve first.");
      }

      // Step 2: Create collection auction
      const hash = await writeContractAsync({
        address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
        abi: ABI_CONFIG.sealedBidAuction.abi,
        functionName: "createCollectionAuction",
        args: [nftContract, tokenIds, startingPrice, reservePrice, minBidIncrement, duration, title, description],
      });
      
      console.log("Create Collection Auction Txhash:", hash);
      const receipt = await client?.waitForTransactionReceipt({ hash });
      console.log("Status:", receipt?.status === "success" ? "Success" : "Failed");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Create Collection Auction Error:", error.message);
      throw error;
    }
  };

  // Helper function to create auction with auto-approval
  const createSingleNFTAuctionWithApproval = async (
    nftContract: string,
    tokenId: number,
    startingPrice: number,
    reservePrice: number,
    minBidIncrement: number,
    duration: number,
    title: string,
    description: string,
    userAddress: string
  ) => {
    try {
      console.log("Create Single NFT Auction with Approval:", {
        nftContract,
        tokenId,
        startingPrice,
        reservePrice,
        minBidIncrement,
        duration,
        title,
        description,
        userAddress
      });

      // Step 1: Check current approval status
      const approvalCheck = await checkSingleNFTApproval(nftContract, tokenId, userAddress);
      
      // Step 2: Request approval if needed
      if (approvalCheck.needsApproval) {
        console.log("NFT not approved, requesting approval...");
        await approveNFT(nftContract, tokenId);
        console.log("NFT approved successfully");
      }

      // Step 3: Create auction
      const hash = await writeContractAsync({
        address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
        abi: ABI_CONFIG.sealedBidAuction.abi,
        functionName: "createSingleNFTAuction",
        args: [
          nftContract as `0x${string}`,
          BigInt(tokenId),
          BigInt(startingPrice),
          BigInt(reservePrice),
          BigInt(minBidIncrement),
          BigInt(duration),
          title,
          description
        ],
      });
      
      console.log("Single NFT auction created:", hash);
      const receipt = await client?.waitForTransactionReceipt({ hash });
      console.log("Status:", receipt?.status === "success" ? "Success" : "Failed");
      
      return { hash, receipt };

    } catch (error: any) {
      console.error("Create Single NFT Auction with Approval Error:", error);
      throw error;
    }
  };

  const createCollectionAuctionWithApproval = async (
    nftContract: string,
    tokenIds: number[],
    startingPrice: number,
    reservePrice: number,
    minBidIncrement: number,
    duration: number,
    title: string,
    description: string,
    userAddress: string
  ) => {
    try {
      console.log("Create Collection Auction with Approval:", {
        nftContract,
        tokenIds,
        startingPrice,
        reservePrice,
        minBidIncrement,
        duration,
        title,
        description,
        userAddress
      });

      // Step 1: Check current approval status
      const approvalCheck = await checkCollectionApproval(nftContract, tokenIds, userAddress);
      
      // Step 2: Request approval if needed
      if (approvalCheck.needsApproval) {
        console.log("Collection not approved, requesting approval...");
        await approveCollection(nftContract);
        console.log("Collection approved successfully");
      }

      // Step 3: Create collection auction
      const hash = await writeContractAsync({
        address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
        abi: ABI_CONFIG.sealedBidAuction.abi,
        functionName: "createCollectionAuction",
        args: [
          nftContract as `0x${string}`,
          tokenIds.map(id => BigInt(id)),
          BigInt(startingPrice),
          BigInt(reservePrice),
          BigInt(minBidIncrement),
          BigInt(duration),
          title,
          description
        ],
      });
      
      console.log("Collection auction created:", hash);
      const receipt = await client?.waitForTransactionReceipt({ hash });
      console.log("Status:", receipt?.status === "success" ? "Success" : "Failed");
      
      return { hash, receipt };

    } catch (error: any) {
      console.error("Create Collection Auction with Approval Error:", error);
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
      
      console.log("Place Bid Txhash:", hash);
      const receipt = await client?.waitForTransactionReceipt({ hash });
      console.log("Status:", receipt?.status === "success" ? "Success" : "Failed");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Place Bid Error:", error.message);
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
      
      console.log("Finalize Auction Txhash:", hash);
      const receipt = await client?.waitForTransactionReceipt({ hash });
      console.log("Status:", receipt?.status === "success" ? "Success" : "Failed");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Finalize Auction Error:", error.message);
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
      
      console.log("Cancel Auction Txhash:", hash);
      const receipt = await client?.waitForTransactionReceipt({ hash });
      console.log("Status:", receipt?.status === "success" ? "Success" : "Failed");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Cancel Auction Error:", error.message);
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
      
      console.log("Claim NFT Txhash:", hash);
      const receipt = await client?.waitForTransactionReceipt({ hash });
      console.log("Status:", receipt?.status === "success" ? "Success" : "Failed");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Claim NFT Error:", error.message);
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
      
      console.log("Reclaim NFT Txhash:", hash);
      const receipt = await client?.waitForTransactionReceipt({ hash });
      console.log("Status:", receipt?.status === "success" ? "Success" : "Failed");
      
      return { hash, receipt };
    } catch (error: any) {
      console.error("Reclaim NFT Error:", error.message);
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

  // ✅ Get auction details function for modal
  const getAuctionDetails = async (auctionId: number) => {
    try {
      if (!client) {
        throw new Error("Public client not available")
      }

      const auction = await client.readContract({
        address: ABI_CONFIG.sealedBidAuction.address as `0x${string}`,
        abi: ABI_CONFIG.sealedBidAuction.abi,
        functionName: "getAuction",
        args: [BigInt(auctionId)],
      })

      return auction
    } catch (error) {
      console.error("Error getting auction details:", error)
      throw error
    }
  };

  return {
    // Write functions with approval check
    createSingleNFTAuction,
    createCollectionAuction,
    createSingleNFTAuctionWithApproval,
    createCollectionAuctionWithApproval,
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
    getAuctionDetails,

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

    // Approval utilities
    checkSingleNFTApproval,
    checkCollectionApproval,
  };
}