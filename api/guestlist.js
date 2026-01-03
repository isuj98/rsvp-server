import { connectToDatabase } from './_db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { db } = await connectToDatabase();

    // GET all guests
    if (req.method === 'GET') {
      const guestlist = await db.collection('guestlist').find({}).toArray();
      const names = guestlist.map(g => g.name).sort();
      return res.json(names);
    }

    // POST add new guests
    if (req.method === 'POST') {
      const { guests, guestlist, replace } = req.body;
      
      // Handle import endpoint
      if (guestlist && Array.isArray(guestlist)) {
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
      }
      
      // Handle regular add guests
      if (!Array.isArray(guests) || guests.length === 0) {
        return res.status(400).json({ error: 'Expected an array of guest names' });
      }
      
      const existingGuests = await db.collection('guestlist').find({}).toArray();
      const existingNames = new Set(existingGuests.map(g => g.name.toLowerCase()));
      
      const newGuests = guests
        .map(name => name.trim())
        .filter(name => name.length > 0 && !existingNames.has(name.toLowerCase()))
        .map(name => ({ name, createdAt: new Date().toISOString() }));
      
      if (newGuests.length > 0) {
        await db.collection('guestlist').insertMany(newGuests);
      }
      
      const updatedList = await db.collection('guestlist').find({}).toArray();
      const names = updatedList.map(g => g.name).sort();
      
      return res.status(201).json(names);
    }

    // PUT update entire guestlist
    if (req.method === 'PUT') {
      const guestlist = req.body;
      
      if (!Array.isArray(guestlist)) {
        return res.status(400).json({ error: 'Expected an array of guest names' });
      }
      
      const normalized = guestlist
        .map(name => name.trim())
        .filter(name => name.length > 0)
        .map(name => ({ name, createdAt: new Date().toISOString() }));
      
      await db.collection('guestlist').deleteMany({});
      if (normalized.length > 0) {
        await db.collection('guestlist').insertMany(normalized);
      }
      
      const names = normalized.map(g => g.name).sort();
      return res.json(names);
    }

    // DELETE guest by name
    if (req.method === 'DELETE') {
      const { name } = req.query;
      
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      const result = await db.collection('guestlist').deleteOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Guest not found' });
      }
      
      const updatedList = await db.collection('guestlist').find({}).toArray();
      const names = updatedList.map(g => g.name).sort();
      
      return res.json(names);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      type: error.name
    });
  }
}

