import express from 'express';
import bcrypt from 'bcrypt';
const router = express.Router();

// POST login - authenticate admin
router.post('/login', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Find admin by username
    const admin = await db.collection('admin').findOne({ username: username.toLowerCase() });
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Compare password with hashed password
    const passwordMatch = await bcrypt.compare(password, admin.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await db.collection('admin').updateOne(
      { _id: admin._id },
      { $set: { lastLogin: new Date().toISOString() } }
    );
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      username: admin.username 
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to authenticate' });
  }
});

// POST create/update admin (for initialization)
router.post('/setup', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Check if admin already exists
    const existing = await db.collection('admin').findOne({ username: username.toLowerCase() });
    
    // Hash password
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
      // Update existing admin
      await db.collection('admin').updateOne(
        { _id: existing._id },
        { $set: adminData }
      );
      res.json({ message: 'Admin updated successfully', username: adminData.username });
    } else {
      // Create new admin
      await db.collection('admin').insertOne(adminData);
      res.status(201).json({ message: 'Admin created successfully', username: adminData.username });
    }
  } catch (error) {
    console.error('Error setting up admin:', error);
    res.status(500).json({ error: 'Failed to setup admin' });
  }
});

// GET check if admin exists (for initialization check)
router.get('/check', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const admin = await db.collection('admin').findOne({});
    
    res.json({ exists: !!admin });
  } catch (error) {
    console.error('Error checking admin:', error);
    res.status(500).json({ error: 'Failed to check admin' });
  }
});

export default router;

