/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getRosePrice } from '@/services/rose_usd';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Query parameters for filtering
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = searchParams.get('sortOrder') || 'DESC';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const listingType = searchParams.get('listingType'); // 'single' | 'bundle'
  const search = searchParams.get('search');
  const collection = searchParams.get('collection');

  try {
    const client = await pool.connect();
    
    // Build dynamic query
    let query = `
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
        nft_individual
      FROM market_listings
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let paramCount = 0;

    // Add filters
    if (minPrice) {
      paramCount++;
      query += ` AND price >= $${paramCount}`;
      queryParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      paramCount++;
      query += ` AND price <= $${paramCount}`;
      queryParams.push(parseFloat(maxPrice));
    }

    if (listingType) {
      paramCount++;
      query += ` AND listing_type = $${paramCount}`;
      queryParams.push(listingType);
    }

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR collection_name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (collection) {
      paramCount++;
      query += ` AND collection_name ILIKE $${paramCount}`;
      queryParams.push(`%${collection}%`);
    }

    // Add sorting
    const validSortFields = ['created_at', 'price', 'name', 'listing_id'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${order}`;

    // Add pagination
    const offset = (page - 1) * limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    console.log('🔍 Executing query:', query);
    console.log('📋 Query params:', queryParams);

    const result = await client.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM market_listings
      WHERE 1=1
    `;
    
    const countParams: any[] = [];
    let countParamCount = 0;

    // Add same filters for count
    if (minPrice) {
      countParamCount++;
      countQuery += ` AND price >= $${countParamCount}`;
      countParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      countParamCount++;
      countQuery += ` AND price <= $${countParamCount}`;
      countParams.push(parseFloat(maxPrice));
    }

    if (listingType) {
      countParamCount++;
      countQuery += ` AND listing_type = $${countParamCount}`;
      countParams.push(listingType);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (name ILIKE $${countParamCount} OR collection_name ILIKE $${countParamCount} OR description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    if (collection) {
      countParamCount++;
      countQuery += ` AND collection_name ILIKE $${countParamCount}`;
      countParams.push(`%${collection}%`);
    }

    const countResult = await client.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    client.release();

    // Get current Rose price for USD conversion
    const rosePrice = await getRosePrice();

    // Transform data
    const listings = result.rows.map((row: any) => {
      const priceInRose = parseFloat(row.price);
      const usdPrice = rosePrice ? (priceInRose * rosePrice).toFixed(2) : null;
      
      // For bundle listings, get representative image and count
      let displayImage = row.image_url;
      let bundleCount = 1;
      
      if (row.listing_type === 'bundle' && row.nft_individual) {
        bundleCount = Array.isArray(row.token_ids) ? row.token_ids.length : 1;
        
        // If no image_url, try to get from first NFT in bundle
        if (!displayImage && Array.isArray(row.nft_individual) && row.nft_individual.length > 0) {
          displayImage = row.nft_individual[0]?.metadata?.image || 
                        row.nft_individual[0]?.metadata?.metadata?.image;
        }
      }

      return {
        id: row.listing_id.toString(),
        name: row.name || `${row.listing_type === 'bundle' ? 'Bundle' : 'NFT'} #${row.listing_id}`,
        collection: row.collection_name || 'Unknown Collection',
        image: displayImage || '/placeholder.svg',
        price: `${priceInRose} ROSE`,
        usdPrice: usdPrice ? `$${usdPrice}` : null,
        lastSale: null, // You can add this field to your database if needed
        timeLeft: null, // This would be for auctions
        isAuction: false, // Marketplace listings are not auctions
        views: 0, // You can add view tracking later
        likes: 0, // You can add like functionality later
        verified: false, // You can add verification logic
        rarity: 'Common', // You can extract this from metadata
        listing_type: row.listing_type,
        seller_address: row.seller_address,
        nft_contract_address: row.nft_contract_address,
        created_at: row.created_at,
        bundle_count: row.listing_type === 'bundle' ? bundleCount : undefined,
        token_ids: row.token_ids,
        nft_individual: row.nft_individual
      };
    });

    return NextResponse.json({
      success: true,
      data: listings,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit
      },
      rose_price_usd: rosePrice
    });

  } catch (error) {
    console.error('❌ Error fetching marketplace data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch marketplace data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}