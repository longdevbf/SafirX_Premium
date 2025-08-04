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
       VALUES (?, 0, 0, 0.0, 'Unnamed User', 0, 0, NOW())`,
      [address]
    );

    return NextResponse.json({ 
      message: 'User created successfully', 
      exists: false,
      user: {
        address,
        name: 'Unnamed User',
        username: null,
        bio: null,
        avatar: null,
        banner: null,
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

    const [users] = await connection.execute(
      'SELECT * FROM users WHERE address = ?',
      [address]
    ) as mysql.RowDataPacket[][];

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];
    
    // Format dữ liệu trước khi trả về
    const formattedUser = {
      address: user.address,
      name: user.name || 'Unnamed User',
      username: user.username ? user.username.replace('@', '') : null,
      bio: user.bio || null,
      avatar: user.avatar || null,
      banner: user.banner || null,
      created: parseInt(user.created) || 0,
      sold: parseInt(user.sold) || 0,
      total_volume: parseFloat(user.total_volume) || 0,
      followed: parseInt(user.followed) || 0,
      follower: parseInt(user.follower) || 0,
      created_at: user.created_at
    };

    return NextResponse.json({ user: formattedUser });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Thêm API để update user profile
export async function PUT(req: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const { address, name, username, bio, avatar, banner } = await req.json();
    
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Clean username (remove @ if present)
    const cleanUsername = username ? username.replace('@', '') : null;

    // Update user profile
    await connection.execute(
      `UPDATE users SET 
        name = COALESCE(?, name),
        username = ?,
        bio = ?,
        avatar = ?,
        banner = ?
       WHERE address = ?`,
      [name, cleanUsername, bio, avatar, banner, address]
    );

    // Fetch updated user data
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE address = ?',
      [address]
    ) as mysql.RowDataPacket[][];

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = users[0];
    const formattedUser = {
      address: updatedUser.address,
      name: updatedUser.name || 'Unnamed User',
      username: updatedUser.username ? updatedUser.username.replace('@', '') : null,
      bio: updatedUser.bio || null,
      avatar: updatedUser.avatar || null,
      banner: updatedUser.banner || null,
      created: parseInt(updatedUser.created) || 0,
      sold: parseInt(updatedUser.sold) || 0,
      total_volume: parseFloat(updatedUser.total_volume) || 0,
      followed: parseInt(updatedUser.followed) || 0,
      follower: parseInt(updatedUser.follower) || 0,
      created_at: updatedUser.created_at
    };

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: formattedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}