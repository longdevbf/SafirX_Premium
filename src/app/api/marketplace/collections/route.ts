/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT DISTINCT collection_name
      FROM market_listings
      WHERE collection_name IS NOT NULL
      ORDER BY collection_name
    `);

    client.release();

    const collections = result.rows.map((row: { collection_name: any; }) => row.collection_name);

    return NextResponse.json({
      success: true,
      collections: collections
    });

  } catch (error) {
   // //('❌ Error fetching collections:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch collections' 
      },
      { status: 500 }
    );
  }
}