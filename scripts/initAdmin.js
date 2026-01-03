/**
 * Initialize Admin Script
 * Run this script to create the default admin user in MongoDB
 * 
 * Usage: node scripts/initAdmin.js
 */

import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://justinejusi98_db_user:QMXbwUXOrYvXPHMo@rsvp.porkr0i.mongodb.net';
const DB_NAME = 'rsvp';

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'JohnseanKristine2026';

async function initAdmin() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DB_NAME);
    
    // Check if admin already exists
    const existing = await db.collection('admin').findOne({ username: DEFAULT_USERNAME.toLowerCase() });
    
    if (existing) {
      console.log('⚠️  Admin user already exists. Updating password...');
      
      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, saltRounds);
      
      await db.collection('admin').updateOne(
        { _id: existing._id },
        { 
          $set: { 
            password: hashedPassword,
            updatedAt: new Date().toISOString()
          } 
        }
      );
      
      console.log('✅ Admin password updated successfully!');
    } else {
      console.log('📝 Creating new admin user...');
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, saltRounds);
      
      await db.collection('admin').insertOne({
        username: DEFAULT_USERNAME.toLowerCase(),
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null
      });
      
      console.log('✅ Admin user created successfully!');
    }
    
    console.log(`\n📋 Admin Credentials:`);
    console.log(`   Username: ${DEFAULT_USERNAME}`);
    console.log(`   Password: ${DEFAULT_PASSWORD}`);
    console.log(`\n⚠️  Please change the default password after first login!`);
    
  } catch (error) {
    console.error('❌ Error initializing admin:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
}

initAdmin();

