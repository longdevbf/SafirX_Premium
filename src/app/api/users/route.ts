import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
  let client;
  
  try {
    const { address } = await req.json();
    
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Kết nối database
    client = await pool.connect();

    // Kiểm tra xem user đã tồn tại chưa
    const existingUserResult = await client.query(
      'SELECT address FROM users WHERE address = $1',
      [address]
    );

    if (existingUserResult.rows.length > 0) {
      return NextResponse.json({ message: 'User already exists', exists: true });
    }

    // Tạo avatar random từ địa chỉ wallet
    const generateRandomAvatar = (address: string) => {
      const avatarSites = [
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
        `https://api.dicebear.com/7.x/personas/svg?seed=${address}`,
        `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
        `https://api.dicebear.com/7.x/initials/svg?seed=${address}`,
        `https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}`,
      ];
      
      // Sử dụng địa chỉ để chọn avatar style nhất quán
      const index = parseInt(address.slice(-2), 16) % avatarSites.length;
      return avatarSites[index];
    };

    const randomAvatar = generateRandomAvatar(address);

    // Tạo user mới với avatar random
    const insertResult = await client.query(
      `INSERT INTO users (address, created, sold, total_volume, name, followed, follower, avatar, created_at) 
       VALUES ($1, 0, 0, 0.0, 'Unnamed User', 0, 0, $2, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [address, randomAvatar]
    );

    const newUser = insertResult.rows[0];
    const formattedUser = {
      address: newUser.address,
      name: newUser.name || 'Unnamed User',
      username: newUser.username ? newUser.username.replace('@', '') : null,
      bio: newUser.bio || null,
      avatar: newUser.avatar || null,
      banner: newUser.banner || null,
      created: parseInt(newUser.created) || 0,
      sold: parseInt(newUser.sold) || 0,
      total_volume: parseFloat(newUser.total_volume) || 0,
      followed: parseInt(newUser.followed) || 0,
      follower: parseInt(newUser.follower) || 0,
      created_at: newUser.created_at
    };

    return NextResponse.json({ 
      message: 'User created successfully', 
      exists: false,
      user: formattedUser
    });

  } catch (error) {
//    //('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function GET(req: NextRequest) {
  let client;
  
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    client = await pool.connect();

    const result = await client.query(
      'SELECT * FROM users WHERE address = $1',
      [address]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0];
    
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
  //  //('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Thêm API để update user profile
export async function PUT(req: NextRequest) {
  let client;
  
  try {
    const { address, name, username, bio, avatar, banner } = await req.json();
    
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    client = await pool.connect();

    // Clean username (remove @ if present)
    const cleanUsername = username ? username.replace('@', '') : null;

    // Update user profile
    await client.query(
      `UPDATE users SET 
        name = COALESCE($1, name),
        username = $2,
        bio = $3,
        avatar = $4,
        banner = $5
       WHERE address = $6`,
      [name, cleanUsername, bio, avatar, banner, address]
    );

    // Fetch updated user data
    const result = await client.query(
      'SELECT * FROM users WHERE address = $1',
      [address]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = result.rows[0];
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
  //  //('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}