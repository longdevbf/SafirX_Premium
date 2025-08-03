import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(req: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const { address } = await req.json();
    
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Kết nối database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Kiểm tra xem user đã tồn tại chưa
    const [existingUser] = await connection.execute(
      'SELECT address FROM users WHERE address = ?',
      [address]
    ) as mysql.RowDataPacket[][];

    if (existingUser.length > 0) {
      return NextResponse.json({ message: 'User already exists', exists: true });
    }

    // Tạo user mới với giá trị mặc định
    await connection.execute(
      `INSERT INTO users (address, created, sold, total_volume, name, followed, follower, created_at) 
       VALUES (?, 0, 0, 0.0, 'test name', 0, 0, NOW())`,
      [address]
    );

    return NextResponse.json({ 
      message: 'User created successfully', 
      exists: false,
      user: {
        address,
        name: 'test name',
        created: 0,
        sold: 0,
        total_volume: 0.0,
        followed: 0,
        follower: 0
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    // Đảm bảo connection được đóng trong mọi trường hợp
    if (connection) {
      await connection.end();
    }
  }
}

export async function GET(req: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [user] = await connection.execute(
      'SELECT * FROM users WHERE address = ?',
      [address]
    ) as mysql.RowDataPacket[][];

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: user[0] });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    // Đảm bảo connection được đóng trong mọi trường hợp
    if (connection) {
      await connection.end();
    }
  }
}