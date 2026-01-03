import { connectToDatabase } from '../_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'PUT') {
    try {
      const { db } = await connectToDatabase();
      const submissions = req.body;
      
      if (!Array.isArray(submissions)) {
        return res.status(400).json({ error: 'Expected an array of submissions' });
      }
      
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
      
      await db.collection('submissions').deleteMany({});
      const result = await db.collection('submissions').insertMany(normalized);
      
      return res.json({ message: 'Submissions updated', count: result.insertedCount });
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}

