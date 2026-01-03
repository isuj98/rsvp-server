import { connectToDatabase } from '../_db.js';

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
      const { guestlist, replace } = req.body;
      
      if (!Array.isArray(guestlist)) {
        return res.status(400).json({ error: 'Expected an array of guest names' });
      }
      
      const existingGuests = await db.collection('guestlist').find({}).toArray();
      const existingNames = new Set(existingGuests.map(g => g.name.toLowerCase()));
      
      if (replace) {
        await db.collection('guestlist').deleteMany({});
      }
      
      const newGuests = guestlist
        .map(name => name.trim())
        .filter(name => name.length > 0)
        .filter(name => !existingNames.has(name.toLowerCase()))
        .map(name => ({
          name: name,
          createdAt: new Date().toISOString(),
          imported: true
        }));
      
      let insertedCount = 0;
      if (newGuests.length > 0) {
        const result = await db.collection('guestlist').insertMany(newGuests);
        insertedCount = result.insertedCount;
      }
      
      const updatedList = await db.collection('guestlist').find({}).toArray();
      const names = updatedList.map(g => g.name).sort();
      
      return res.json({
        success: true,
        total: names.length,
        added: insertedCount,
        guestlist: names
      });
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}

