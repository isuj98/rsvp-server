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

    // GET all submissions
    if (req.method === 'GET') {
      const { guestName } = req.query;
      
      if (guestName) {
        // GET single submission by guest name
        const submission = await db.collection('submissions').findOne({
          guestName: { $regex: new RegExp(guestName, 'i') }
        });
        
        if (!submission) {
          return res.status(404).json({ error: 'Submission not found' });
        }
        
        return res.json(submission);
      }
      
      // Get all submissions
      const submissions = await db.collection('submissions').find({}).toArray();
      submissions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      return res.json(submissions);
    }

    // POST create or update submission
    if (req.method === 'POST') {
      const submission = req.body;
      
      if (!submission.guestName || !submission.contactNumber) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
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
      
      const existing = await db.collection('submissions').findOne({
        guestName: { $regex: new RegExp(`^${normalized.guestName}$`, 'i') }
      });
      
      if (existing) {
        await db.collection('submissions').updateOne(
          { _id: existing._id },
          { $set: normalized }
        );
        return res.json({ message: 'Submission updated', submission: normalized });
      } else {
        await db.collection('submissions').insertOne(normalized);
        return res.status(201).json({ message: 'Submission created', submission: normalized });
      }
    }


    // DELETE submission
    if (req.method === 'DELETE') {
      const { guestName } = req.query;
      
      if (!guestName) {
        return res.status(400).json({ error: 'Guest name is required' });
      }
      
      const result = await db.collection('submissions').deleteOne({
        guestName: { $regex: new RegExp(`^${guestName}$`, 'i') }
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Submission not found' });
      }
      
      return res.json({ message: 'Submission deleted', guestName });
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

