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
      
      const admin = await db.collection('admin').findOne({ username: username.toLowerCase() });
      
      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const passwordMatch = await bcrypt.compare(password, admin.password);
      
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      await db.collection('admin').updateOne(
        { _id: admin._id },
        { $set: { lastLogin: new Date().toISOString() } }
      );
      
      return res.json({ 
        success: true, 
        message: 'Login successful',
        username: admin.username 
      });
    } catch (error) {
      console.error('API Error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message,
        type: error.name
      });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}

