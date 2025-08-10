/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useReadContract, useWriteContract, usePublicClient } from "wagmi"
import { ABI_CONFIG } from "@/components/config/abi_config"

export function useNFTApproval() {
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  // Check if NFT is approved for marketplace
  const isApprovedForAll = (nftContract: string, owner: string) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: isApproved, refetch } = useReadContract({
      address: nftContract as `0x${string}`,
      abi: [
        {
          "inputs": [
            {"internalType": "address", "name": "owner", "type": "address"},
            {"internalType": "address", "name": "operator", "type": "address"}
          ],
          "name": "isApprovedForAll",
          "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
          "stateMutability": "view",
          "type": "function"
        }
      ],
      functionName: "isApprovedForAll",
      args: [owner as `0x${string}`, ABI_CONFIG.marketPlace.address as `0x${string}`],
      query: { enabled: !!nftContract && !!owner },
    })
    return { isApproved: !!isApproved, refetch }
  }

  // Approve marketplace to transfer NFTs
  const setApprovalForAll = async (nftContract: string, approved: boolean = true) => {
    try {
      const hash = await writeContractAsync({
        address: nftContract as `0x${string}`,
        abi: [
          {
            "inputs": [
              {"internalType": "address", "name": "operator", "type": "address"},
              {"internalType": "bool", "name": "approved", "type": "bool"}
            ],
            "name": "setApprovalForAll",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: "setApprovalForAll",
        args: [ABI_CONFIG.marketPlace.address as `0x${string}`, approved],
      })

      //("Approval hash:", hash)
      const receipt = await publicClient?.waitForTransactionReceipt({ hash })
      //("Approval status:", receipt?.status === "success" ? "Success" : "Failed")
      
      return { hash, receipt }
    } catch (error: any) {
      //("Approval error:", error.message)
      throw error
    }
  }

  return {
    isApprovedForAll,
    setApprovalForAll,
  }
}