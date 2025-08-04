/* eslint-disable @typescript-eslint/no-explicit-any */

import { useWriteContract, usePublicClient } from "wagmi"
import { ABI_CONFIG } from "@/components/config/abi_config"

export function useNFTAuctionApproval() {
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  // ✅ Sử dụng địa chỉ từ ABI_CONFIG
  const AUCTION_CONTRACT_ADDRESS = ABI_CONFIG.sealedBidAuction.address

  // Move publicClient call outside of nested functions
  const client = publicClient

  // Check if specific NFT is approved for auction contract
  const getApproved = async (nftContract: string, tokenId: number) => {
    try {
      if (!client) {
        throw new Error("Public client not available")
      }

      const approved = await client.readContract({
        address: nftContract as `0x${string}`,
        abi: [
          {
            inputs: [{ name: "tokenId", type: "uint256" }],
            name: "getApproved",
            outputs: [{ name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "getApproved",
        args: [BigInt(tokenId)],
      })

      return approved as string
    } catch (error) {
      console.error("Error getting approved address:", error)
      throw error
    }
  }

  // Check if operator is approved for all tokens
  const isApprovedForAll = async (nftContract: string, owner: string) => {
    try {
      if (!client) {
        throw new Error("Public client not available")
      }

      const isApproved = await client.readContract({
        address: nftContract as `0x${string}`,
        abi: [
          {
            inputs: [
              { name: "owner", type: "address" },
              { name: "operator", type: "address" }
            ],
            name: "isApprovedForAll",
            outputs: [{ name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "isApprovedForAll",
        args: [owner as `0x${string}`, AUCTION_CONTRACT_ADDRESS as `0x${string}`],
      })

      return isApproved as boolean
    } catch (error) {
      console.error("Error checking approval for all:", error)
      throw error
    }
  }

  // Get owner of NFT
  const getOwnerOf = async (nftContract: string, tokenId: number) => {
    try {
      if (!client) {
        throw new Error("Public client not available")
      }

      const owner = await client.readContract({
        address: nftContract as `0x${string}`,
        abi: [
          {
            inputs: [{ name: "tokenId", type: "uint256" }],
            name: "ownerOf",
            outputs: [{ name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "ownerOf",
        args: [BigInt(tokenId)],
      })

      return owner as string
    } catch (error) {
      console.error("Error getting owner:", error)
      throw error
    }
  }

  // Check if single NFT is approved for auction
  const checkSingleNFTApproval = async (
    nftContract: string,
    tokenId: number,
    userAddress: string
  ) => {
    try {
      console.log("Checking approval for NFT:", { nftContract, tokenId, userAddress })

      // Check if user owns the NFT
      const owner = await getOwnerOf(nftContract, tokenId)
      if (owner.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error("You don't own this NFT")
      }

      // Check if specific token is approved
      const approved = await getApproved(nftContract, tokenId)
      const isTokenApproved = approved.toLowerCase() === AUCTION_CONTRACT_ADDRESS.toLowerCase()

      // Check if operator is approved for all
      const isOperatorApproved = await isApprovedForAll(nftContract, userAddress)

      return {
        isApproved: isTokenApproved || isOperatorApproved,
        needsApproval: !isTokenApproved && !isOperatorApproved,
        approvalType: isOperatorApproved ? 'operator' : isTokenApproved ? 'token' : 'none'
      }
    } catch (error) {
      console.error("Error checking single NFT approval:", error)
      throw error
    }
  }

  // Check if collection is approved for auction
  const checkCollectionApproval = async (
    nftContract: string,
    tokenIds: number[],
    userAddress: string
  ) => {
    try {
      console.log("Checking collection approval:", { nftContract, tokenIds, userAddress })

      // Check if operator is approved for all (more efficient for multiple NFTs)
      const isOperatorApproved = await isApprovedForAll(nftContract, userAddress)
      
      if (isOperatorApproved) {
        return {
          isApproved: true,
          needsApproval: false,
          approvalType: 'operator'
        }
      }

      // If not approved for all, check individual tokens
      const approvalPromises = tokenIds.map(tokenId => getApproved(nftContract, tokenId))
      const approvals = await Promise.all(approvalPromises)
      
      const allApproved = approvals.every(approved => 
        approved.toLowerCase() === AUCTION_CONTRACT_ADDRESS.toLowerCase()
      )

      return {
        isApproved: allApproved,
        needsApproval: !allApproved,
        approvalType: allApproved ? 'individual' : 'none'
      }
    } catch (error) {
      console.error("Error checking collection approval:", error)
      throw error
    }
  }

  // ✅ Approve specific NFT for auction - với receipt confirmation
  const approveNFT = async (nftContract: string, tokenId: number) => {
    try {
      console.log("Approving NFT for auction:", { nftContract, tokenId })

      const hash = await writeContractAsync({
        address: nftContract as `0x${string}`,
        abi: [
          {
            inputs: [
              { name: "to", type: "address" },
              { name: "tokenId", type: "uint256" }
            ],
            name: "approve",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "approve",
        args: [AUCTION_CONTRACT_ADDRESS as `0x${string}`, BigInt(tokenId)],
      })

      console.log("NFT approval hash:", hash)
      
      // ✅ Wait for transaction receipt
      const receipt = await client?.waitForTransactionReceipt({ hash })
      console.log("NFT approval status:", receipt?.status === "success" ? "Success" : "Failed")
      
      if (receipt?.status !== "success") {
        throw new Error("NFT approval transaction failed")
      }

      return { hash, receipt }
    } catch (error: any) {
      console.error("Error approving NFT:", error)
      throw error
    }
  }

  // ✅ Set approval for all NFTs in collection - với receipt confirmation
  const setApprovalForAll = async (nftContract: string, approved: boolean = true) => {
    try {
      console.log("Setting approval for all NFTs:", { nftContract, approved })

      const hash = await writeContractAsync({
        address: nftContract as `0x${string}`,
        abi: [
          {
            inputs: [
              { name: "operator", type: "address" },
              { name: "approved", type: "bool" }
            ],
            name: "setApprovalForAll",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "setApprovalForAll",
        args: [AUCTION_CONTRACT_ADDRESS as `0x${string}`, approved],
      })

      console.log("Approval for all hash:", hash)
      
      // ✅ Wait for transaction receipt
      const receipt = await client?.waitForTransactionReceipt({ hash })
      console.log("Approval for all status:", receipt?.status === "success" ? "Success" : "Failed")
      
      if (receipt?.status !== "success") {
        throw new Error("Set approval for all transaction failed")
      }

      return { hash, receipt }
    } catch (error: any) {
      console.error("Error setting approval for all:", error)
      throw error
    }
  }

  // ✅ Approve collection for auction (uses setApprovalForAll) - với receipt confirmation
  const approveCollection = async (nftContract: string) => {
    try {
      console.log("Approving collection for auction:", nftContract)
      const result = await setApprovalForAll(nftContract, true)
      console.log("Collection approval completed:", result)
      return result
    } catch (error: any) {
      console.error("Error approving collection:", error)
      throw error
    }
  }

  return {
    checkSingleNFTApproval,
    checkCollectionApproval,
    approveNFT,
    approveCollection,
    setApprovalForAll,
    getOwnerOf,
    getApproved,
    isApprovedForAll
  }
}