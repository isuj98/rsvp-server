import express from 'express';
const router = express.Router();

// GET all submissions
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const submissions = await db.collection('submissions').find({}).toArray();
    
    // Sort by timestamp (newest first)
    submissions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// GET single submission by guest name
router.get('/:guestName', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const guestName = req.params.guestName;
    
    const submission = await db.collection('submissions').findOne({
      guestName: { $regex: new RegExp(guestName, 'i') }
    });
    
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    res.json(submission);
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// POST create or update submission
router.post('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const submission = req.body;
    
    // Validate required fields
    if (!submission.guestName || !submission.contactNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Normalize submission
    const normalized = {
      guestName: submission.guestName.trim(),
      contactNumber: submission.contactNumber.trim(),
      isAttending: submission.isAttending ?? true,
      companions: (submission.companions || []).map(c => ({
        id: c.id || Date.now().toString(),
        name: c.name.trim()
      })).filter(c => c.name.length > 0),
      message: (submission.message || '').trim(),
      timestamp: submission.timestamp || new Date().toISOString()
    };
    
    // Check if submission exists (case-insensitive)
    const existing = await db.collection('submissions').findOne({
      guestName: { $regex: new RegExp(`^${normalized.guestName}$`, 'i') }
    });
    
    let result;
    if (existing) {
      // Update existing
      result = await db.collection('submissions').updateOne(
        { _id: existing._id },
        { $set: normalized }
      );
      res.json({ message: 'Submission updated', submission: normalized });
    } else {
      // Create new
      result = await db.collection('submissions').insertOne(normalized);
      res.status(201).json({ message: 'Submission created', submission: normalized });
    }
  } catch (error) {
    console.error('Error saving submission:', error);
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

// PUT update all submissions (for bulk operations)
router.put('/bulk', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const submissions = req.body;
    
    if (!Array.isArray(submissions)) {
      return res.status(400).json({ error: 'Expected an array of submissions' });
    }
    
    // Normalize all submissions
    const normalized = submissions.map(sub => ({
      guestName: sub.guestName.trim(),
      contactNumber: sub.contactNumber.trim(),
      isAttending: sub.isAttending ?? true,
      companions: (sub.companions || []).map(c => ({
        id: c.id || Date.now().toString(),
        name: c.name.trim()
      })).filter(c => c.name.length > 0),
      message: (sub.message || '').trim(),
      timestamp: sub.timestamp || new Date().toISOString()
    }));
    
    // Delete all existing and insert new
    await db.collection('submissions').deleteMany({});
    const result = await db.collection('submissions').insertMany(normalized);
    
    res.json({ 
      message: 'Submissions updated', 
      count: result.insertedCount 
    });
  } catch (error) {
    console.error('Error updating submissions:', error);
    res.status(500).json({ error: 'Failed to update submissions' });
  }
});

// DELETE submission by guest name
router.delete('/:guestName', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const guestName = req.params.guestName;
    
    const result = await db.collection('submissions').deleteOne({
      guestName: { $regex: new RegExp(`^${guestName}$`, 'i') }
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    res.json({ message: 'Submission deleted', guestName });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

export default router;

