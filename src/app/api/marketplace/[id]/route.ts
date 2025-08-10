import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getRosePrice } from '@/services/rose_usd';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        id,
        listing_id,
        nft_contract_address,
        seller_address,
        token_ids,
        price,
        listing_type,
        collection_name,
        image_url,
        description,
        name,
        created_at,
        nft_individual,
        views_count,
        love_count
      FROM market_listings
      WHERE listing_id = $1
    `, [id]);

    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'NFT or Collection not found' 
        },
        { status: 404 }
      );
    }

    const listing = result.rows[0];
    
    const rosePrice = await getRosePrice();
    const priceInRose = parseFloat(listing.price);
    const usdPrice = rosePrice ? (priceInRose * rosePrice).toFixed(2) : null;

    const responseData = {
      id: listing.listing_id.toString(),
      listing_id: listing.listing_id,
      name: listing.name || `${listing.listing_type === 'bundle' ? 'Collection Bundle' : 'NFT'} #${listing.listing_id}`,
      collection: listing.collection_name || 'Unknown Collection',
      image: listing.image_url || '/placeholder.svg',
      price: `${priceInRose} ROSE`,
      usdPrice: usdPrice ? `$${usdPrice}` : null,
      description: listing.description || 'No description available',
      listing_type: listing.listing_type,
      seller_address: listing.seller_address,
      nft_contract_address: listing.nft_contract_address,
      created_at: listing.created_at,
      token_ids: listing.token_ids,
      nft_individual: listing.nft_individual || [],
      bundle_count: listing.listing_type === 'bundle' ? (Array.isArray(listing.token_ids) ? listing.token_ids.length : 1) : undefined,
      metadata: listing.listing_type === 'single' && listing.nft_individual && listing.nft_individual.length > 0 
        ? listing.nft_individual[0].metadata 
        : null,
      views_count: listing.views_count || 0,
      love_count: listing.love_count || 0
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      rose_price_usd: rosePrice
    });

  } catch (error) {
   // //('❌ Error fetching NFT details:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch NFT details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}