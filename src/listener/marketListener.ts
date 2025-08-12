/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'ethers';
import * as NFTMarketPlace from '../../contract/safirX_contract/artifacts/contracts/marketPlace.sol/NFTMarket.json';
import { performIncrementalSync } from './syncService';
import axios from 'axios';
import {ABI_CONFIG} from '@/components/config/abi_config'
import { pool } from '../lib/db';
// Địa chỉ contract
const marketAddress = ABI_CONFIG.marketPlace.address;
const provider = new ethers.WebSocketProvider('wss://sapphire.oasis.io/ws');
const marketContract = new ethers.Contract(marketAddress, NFTMarketPlace.abi, provider);

async function fetchNFTMetadata(contractAddress: string, tokenId: string) {
    const url = `https://nexus.oasis.io/v1/sapphire/evm_tokens/${contractAddress}/nfts/${tokenId}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        return null;
    }
}
async function saveToDatabase(data: any) {
    const client = await pool.connect();
    try {
        await client.query(
            `INSERT INTO market_listings (
                listing_id, nft_contract_address, seller_address, token_ids, price,
                listing_type, collection_name, image_url, description, name, nft_individual
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
                data.listing_id,
                data.nft_contract_address,
                data.seller_address,
                JSON.stringify(data.token_ids),
                data.price,
                data.listing_type,
                data.collection_name,
                data.image_url,
                data.description,
                data.name,
                JSON.stringify(data.nft_individual)
            ]
        );
    } catch (error) {
        
    } finally {
        client.release();
    }
}

async function updatePrice(listingId: string, newPrice: string, listingType: string) {
    const client = await pool.connect();
    try {
        await client.query(
            `UPDATE market_listings SET price = $1 WHERE listing_id = $2 AND listing_type = $3`,
            [newPrice, listingId, listingType]
        );
    } catch (error) {
    } finally {
        client.release();
    }
}

// Hàm xóa bản ghi
async function deleteFromDatabase(listingId: string, listingType: string) {
    const client = await pool.connect();
    try {
        await client.query(
            `DELETE FROM market_listings WHERE listing_id = $1 AND listing_type = $2`,
            [listingId, listingType]
        );
    } catch (error) {
    } finally {
        client.release();
    }
}

async function main() {
    setTimeout(() => {
        setInterval(async () => {
            try {
                await performIncrementalSync();
            } catch (error) {
            
            }
        }, 5 * 60 * 1000); 
    }, 2.5 * 60 * 1000); 

    // Sự kiện NFTListed
    marketContract.on('NFTListed', async (listingId, nftContract, tokenId, seller, price, listingType) => {
        const listingIdStr = listingId.toString();
        const tokenIdStr = tokenId.toString();
        const priceStr = ethers.formatEther(price);

        const metadata = await fetchNFTMetadata(nftContract, tokenIdStr);
        if (!metadata) return;

        const data = {
            listing_id: listingIdStr,
            nft_contract_address: nftContract,
            seller_address: seller,
            token_ids: [tokenIdStr],
            price: priceStr,
            listing_type: 'single',
            collection_name: metadata.token?.name || '',
            image_url: metadata.image || '',
            description: metadata.description || '',
            name: metadata.name || '',
            nft_individual: [{ token_id: tokenIdStr, metadata }]
        };

        await saveToDatabase(data);
    });

    marketContract.on('CollectionBundleListed', async (collectionId, nftContract, seller, tokenIds, bundlePrice, collectionName) => {
        const collectionIdStr = collectionId.toString();
        const tokenIdsStr = tokenIds.map((id: { toString: () => any; }) => id.toString());
        const bundlePriceStr = ethers.formatEther(bundlePrice); 
        const metadataPromises = tokenIdsStr.map((tokenId: string) => fetchNFTMetadata(nftContract, tokenId));
        const metadataResults = await Promise.all(metadataPromises);

        if (metadataResults.some(result => result === null)) {
            return;
        }

        
        const representativeMetadata = metadataResults[0];

       
        const nftIndividual = tokenIdsStr.map((tokenId: any, index: number) => ({
            token_id: tokenId,
            metadata: metadataResults[index]
        }));

        const data = {
            listing_id: collectionIdStr,
            nft_contract_address: nftContract,
            seller_address: seller,
            token_ids: tokenIdsStr,
            price: bundlePriceStr,
            listing_type: 'bundle',
            collection_name: collectionName || representativeMetadata.token?.name || '',
            image_url: representativeMetadata.image || '',
            description: `Bundle of ${tokenIdsStr.length} NFTs: ${metadataResults.map(m => m.name).join(', ')}`,
            name: `${collectionName || representativeMetadata.token?.name || 'Bundle'} #${collectionIdStr}`,
            nft_individual: nftIndividual
        };

        await saveToDatabase(data);
    });

    marketContract.on('PriceUpdated', async (listingId, oldPrice, newPrice) => {
        const listingIdStr = listingId.toString();
        const newPriceStr = ethers.formatEther(newPrice); 
        await updatePrice(listingIdStr, newPriceStr, 'single');
    });

    // Sự kiện BundlePriceUpdated
    marketContract.on('BundlePriceUpdated', async (collectionId, oldPrice, newPrice) => {
        const collectionIdStr = collectionId.toString();
        const newPriceStr = ethers.formatEther(newPrice); 
        await updatePrice(collectionIdStr, newPriceStr, 'bundle');
    });

    // Sự kiện ListingCancelled
    marketContract.on('ListingCancelled', async (listingId, seller, listingType) => {
        const listingIdStr = listingId.toString();
        await deleteFromDatabase(listingIdStr, 'single');
    });

    // Sự kiện CollectionCancelled
    marketContract.on('CollectionCancelled', async (collectionId, seller, listingType) => {
        const collectionIdStr = collectionId.toString();
        await deleteFromDatabase(collectionIdStr, 'bundle');
    });

    // Sự kiện NFTSold
    marketContract.on('NFTSold', async (listingId, seller, buyer, price, listingType) => {
        const listingIdStr = listingId.toString();
        const priceStr = ethers.formatEther(price); 
        await deleteFromDatabase(listingIdStr, 'single');
    });

    // Sự kiện CollectionBundleSold
    marketContract.on('CollectionBundleSold', async (collectionId, seller, buyer, tokenIds, bundlePrice) => {
        const collectionIdStr = collectionId.toString();
        const bundlePriceStr = ethers.formatEther(bundlePrice); 
      
        await deleteFromDatabase(collectionIdStr, 'bundle');
    });

    process.on('SIGTERM', () => {
        
        process.exit(0);
    });
    
    process.on('SIGINT', () => {
        
        process.exit(0);
    });
}

main().catch();