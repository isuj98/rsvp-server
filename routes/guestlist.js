import express from 'express';
const router = express.Router();

// GET all guests
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const guestlist = await db.collection('guestlist').find({}).toArray();
    
    // Extract names and sort alphabetically
    const names = guestlist.map(g => g.name).sort();
    
    res.json(names);
  } catch (error) {
    console.error('Error fetching guestlist:', error);
    res.status(500).json({ error: 'Failed to fetch guestlist' });
  }
});

// POST add new guests
router.post('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { guests } = req.body;
    
    if (!Array.isArray(guests) || guests.length === 0) {
      return res.status(400).json({ error: 'Expected an array of guest names' });
    }
    
    // Get existing guests
    const existingGuests = await db.collection('guestlist').find({}).toArray();
    const existingNames = new Set(existingGuests.map(g => g.name.toLowerCase()));
    
    // Filter out duplicates
    const newGuests = guests
      .map(name => name.trim())
      .filter(name => name.length > 0 && !existingNames.has(name.toLowerCase()))
      .map(name => ({ name, createdAt: new Date().toISOString() }));
    
    if (newGuests.length > 0) {
      await db.collection('guestlist').insertMany(newGuests);
    }
    
    // Return updated list
    const updatedList = await db.collection('guestlist').find({}).toArray();
    const names = updatedList.map(g => g.name).sort();
    
    res.status(201).json(names);
  } catch (error) {
    console.error('Error adding guests:', error);
    res.status(500).json({ error: 'Failed to add guests' });
  }
});

// PUT update entire guestlist
router.put('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const guestlist = req.body;
    
    if (!Array.isArray(guestlist)) {
      return res.status(400).json({ error: 'Expected an array of guest names' });
    }
    
    // Normalize and create documents
    const normalized = guestlist
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .map(name => ({ name, createdAt: new Date().toISOString() }));
    
    // Delete all existing and insert new
    await db.collection('guestlist').deleteMany({});
    if (normalized.length > 0) {
      await db.collection('guestlist').insertMany(normalized);
    }
    
    const names = normalized.map(g => g.name).sort();
    res.json(names);
  } catch (error) {
    console.error('Error updating guestlist:', error);
    res.status(500).json({ error: 'Failed to update guestlist' });
  }
});

// DELETE guest by name
router.delete('/:name', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const name = req.params.name;
    
    const result = await db.collection('guestlist').deleteOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    
    // Return updated list
    const updatedList = await db.collection('guestlist').find({}).toArray();
    const names = updatedList.map(g => g.name).sort();
    
    res.json(names);
  } catch (error) {
    console.error('Error deleting guest:', error);
    res.status(500).json({ error: 'Failed to delete guest' });
  }
});

export default router;

