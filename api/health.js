import { connectToDatabase } from './_db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase();
      // Test connection by running a simple query
      await db.admin().ping();
      
      return res.json({ 
        status: 'ok', 
        database: 'connected', 
        timestamp: new Date().toISOString(),
        mongodbUri: process.env.MONGODB_URI ? 'set' : 'missing'
      });
    } catch (error) {
      console.error('Health check error:', error);
      return res.status(500).json({ 
        status: 'error', 
        database: 'disconnected',
        error: error.message,
        mongodbUri: process.env.MONGODB_URI ? 'set' : 'missing'
      });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}

