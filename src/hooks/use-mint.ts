/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useReadContract,
  useWriteContract,
  usePublicClient,
} from "wagmi";
import { ABI_CONFIG } from "@/components/config/abi_config";

export function useNFTMint() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // Hàm mint single NFT cho địa chỉ cụ thể
  const mintSingleNFT = async (to: string, metadataURI: string) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.mintNFT.address as `0x${string}`,
        abi: ABI_CONFIG.mintNFT.abi,
        functionName: "mintSingleNFT",
        args: [to, metadataURI],
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

  // Hàm mint NFT cho chính mình (single NFT)
  const mintNFT = async (metadataURI: string) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.mintNFT.address as `0x${string}`,
        abi: ABI_CONFIG.mintNFT.abi,
        functionName: "mintNFT",
        args: [metadataURI],
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

  // Hàm mint NFT collection cho địa chỉ cụ thể (có thể mint 1 hoặc nhiều NFT)
  const mintNFTCollection = async (to: string, metadataURIs: string[]) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.mintNFT.address as `0x${string}`,
        abi: ABI_CONFIG.mintNFT.abi,
        functionName: "mintNFTCollection",
        args: [to, metadataURIs],
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

  // Hàm mint collection cho chính mình (có thể mint 1 hoặc nhiều NFT)
  const mintMyCollection = async (metadataURIs: string[]) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.mintNFT.address as `0x${string}`,
        abi: ABI_CONFIG.mintNFT.abi,
        functionName: "mintMyCollection",
        args: [metadataURIs],
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

  // Hàm mint collection với baseURI (tiện lợi cho mint nhiều NFT cùng pattern)
  const mintCollectionWithBaseURI = async (to: string, quantity: number, baseURI: string) => {
    try {
      const hash = await writeContractAsync({
        address: ABI_CONFIG.mintNFT.address as `0x${string}`,
        abi: ABI_CONFIG.mintNFT.abi,
        functionName: "mintCollectionWithBaseURI",
        args: [to, quantity, baseURI],
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

  // Các hàm đọc dữ liệu cần thiết
  const getTotalNFT = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.mintNFT.address as `0x${string}`,
      abi: ABI_CONFIG.mintNFT.abi,
      functionName: "getTotalNFT",
    });
    return data;
  };

  const getRemainingSupply = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.mintNFT.address as `0x${string}`,
      abi: ABI_CONFIG.mintNFT.abi,
      functionName: "getRemainingSupply",
    });
    return data;
  };

  const getBalanceOf = (owner: string) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.mintNFT.address as `0x${string}`,
      abi: ABI_CONFIG.mintNFT.abi,
      functionName: "balanceOf",
      args: [owner],
      query: { enabled: !!owner },
    });
    return data;
  };

  const getTokenURI = (tokenId: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.mintNFT.address as `0x${string}`,
      abi: ABI_CONFIG.mintNFT.abi,
      functionName: "tokenURI",
      args: [tokenId],
      query: { enabled: tokenId >= 0 },
    });
    return data;
  };

  const getTokensOfOwner = (owner: string) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.mintNFT.address as `0x${string}`,
      abi: ABI_CONFIG.mintNFT.abi,
      functionName: "getTokensOfOwner",
      args: [owner],
      query: { enabled: !!owner },
    });
    return data;
  };

  const getTokenCreator = (tokenId: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.mintNFT.address as `0x${string}`,
      abi: ABI_CONFIG.mintNFT.abi,
      functionName: "getTokenCreator",
      args: [tokenId],
      query: { enabled: tokenId >= 0 },
    });
    return data;
  };

  // Constants từ contract
  const getMaxNFT = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.mintNFT.address as `0x${string}`,
      abi: ABI_CONFIG.mintNFT.abi,
      functionName: "MAX_NFT",
    });
    return data;
  };

  const getMaxBatchSize = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.mintNFT.address as `0x${string}`,
      abi: ABI_CONFIG.mintNFT.abi,
      functionName: "MAX_BATCH_SIZE",
    });
    return data;
  };

  // Standard ERC721 functions
  const ownerOf = (tokenId: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.mintNFT.address as `0x${string}`,
      abi: ABI_CONFIG.mintNFT.abi,
      functionName: "ownerOf",
      args: [tokenId],
      query: { enabled: tokenId >= 0 },
    });
    return data;
  };

  const getApproved = (tokenId: number) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.mintNFT.address as `0x${string}`,
      abi: ABI_CONFIG.mintNFT.abi,
      functionName: "getApproved",
      args: [tokenId],
      query: { enabled: tokenId >= 0 },
    });
    return data;
  };

  const isApprovedForAll = (owner: string, operator: string) => {
    const { data } = useReadContract({
      address: ABI_CONFIG.mintNFT.address as `0x${string}`,
      abi: ABI_CONFIG.mintNFT.abi,
      functionName: "isApprovedForAll",
      args: [owner, operator],
      query: { enabled: !!owner && !!operator },
    });
    return data;
  };

  const name = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.mintNFT.address as `0x${string}`,
      abi: ABI_CONFIG.mintNFT.abi,
      functionName: "name",
    });
    return data;
  };

  const symbol = () => {
    const { data } = useReadContract({
      address: ABI_CONFIG.mintNFT.address as `0x${string}`,
      abi: ABI_CONFIG.mintNFT.abi,
      functionName: "symbol",
    });
    return data;
  };

  return {
    // Write functions - Hàm mint
    mintSingleNFT,          // Mint single NFT cho địa chỉ cụ thể
    mintNFT,                // Mint single NFT cho chính mình
    mintNFTCollection,      // Mint cho địa chỉ cụ thể với metadata URIs
    mintMyCollection,       // Mint cho chính mình với metadata URIs
    mintCollectionWithBaseURI, // Mint với base URI pattern

    // Read functions - Thông tin cần thiết
    getTotalNFT,
    getRemainingSupply,
    getBalanceOf,
    getTokenURI,
    getTokensOfOwner,
    getTokenCreator,
    getMaxNFT,
    getMaxBatchSize,

    // Standard ERC721 functions
    ownerOf,
    getApproved,
    isApprovedForAll,
    name,
    symbol,
  };
}