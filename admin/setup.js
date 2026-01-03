import { connectToDatabase } from '../_db.js';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { db } = await connectToDatabase();
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
      
      const existing = await db.collection('admin').findOne({ username: username.toLowerCase() });
      
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const adminData = {
        username: username.toLowerCase(),
        password: hashedPassword,
        createdAt: existing ? existing.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: existing ? existing.lastLogin : null
      };
      
      if (existing) {
        await db.collection('admin').updateOne(
          { _id: existing._id },
          { $set: adminData }
        );
        return res.json({ message: 'Admin updated successfully', username: adminData.username });
      } else {
        await db.collection('admin').insertOne(adminData);
        return res.status(201).json({ message: 'Admin created successfully', username: adminData.username });
      }
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}

