/**
 * MongoDB Connection Helper for Vercel Serverless Functions
 * Creates a connection per request (Vercel serverless functions don't support persistent connections)
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://justinejusi98_db_user:QMXbwUXOrYvXPHMo@rsvp.porkr0i.mongodb.net/admin';
const DB_NAME = 'rsvp';

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  // In serverless environments, reuse connections when possible
  // But check if connection is still alive
  if (cachedClient && cachedDb) {
    try {
      // Ping the database to check if connection is still alive
      await cachedDb.admin().ping();
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      // Connection is dead, reset cache
      console.log('Cached connection is dead, creating new connection');
      cachedClient = null;
      cachedDb = null;
    }
  }

  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const client = await MongoClient.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });

    const db = client.db(DB_NAME);
    
    // Test the connection
    await db.admin().ping();

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Reset cache on error
    cachedClient = null;
    cachedDb = null;
    
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
}

