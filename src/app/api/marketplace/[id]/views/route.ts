import { NextResponse } from 'next/server'
import { Pool } from 'pg'

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // Increment views count
    const result = await pool.query(
      'UPDATE market_listings SET views_count = views_count + 1 WHERE listing_id = $1 RETURNING views_count',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Marketplace listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      views_count: result.rows[0].views_count
    });

  } catch (error) {
    console.error('Error incrementing views:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
