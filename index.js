import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import submissionsRoutes from './routes/submissions.js';
import guestlistRoutes from './routes/guestlist.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://justinejusi98_db_user:QMXbwUXOrYvXPHMo@rsvp.porkr0i.mongodb.net';
const DB_NAME = 'rsvp';

let db;
let client;

// Connect to MongoDB
MongoClient.connect(MONGODB_URI)
  .then(connectedClient => {
    console.log('✅ Connected to MongoDB');
    client = connectedClient;
    db = client.db(DB_NAME);
    
    // Make db available to routes
    app.locals.db = db;
    
    // Routes
    app.use('/api/submissions', submissionsRoutes);
    app.use('/api/guestlist', guestlistRoutes);
    app.use('/api/admin', adminRoutes);
    
    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
    });
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  })
  .catch(error => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (client) {
    await client.close();
    console.log('✅ MongoDB connection closed');
  }
  process.exit(0);
});

export default app;

