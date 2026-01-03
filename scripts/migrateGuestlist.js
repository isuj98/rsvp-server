/**
 * Migrate Guestlist Script
 * Transfers guest list data from guestlist.json to MongoDB
 * 
 * Usage: node scripts/migrateGuestlist.js [path/to/guestlist.json]
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://justinejusi98_db_user:QMXbwUXOrYvXPHMo@rsvp.porkr0i.mongodb.net';
const DB_NAME = 'rsvp';

// Default path to guestlist.json (in project root)
const defaultGuestlistPath = join(__dirname, '../../guestlist.json');
const guestlistPath = process.argv[2] || defaultGuestlistPath;

async function migrateGuestlist() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DB_NAME);
    
    console.log(`📖 Reading guestlist from: ${guestlistPath}`);
    
    // Read JSON file
    let guestlistData;
    try {
      const fileContent = readFileSync(guestlistPath, 'utf-8');
      guestlistData = JSON.parse(fileContent);
    } catch (error) {
      console.error(`❌ Error reading guestlist file: ${error.message}`);
      console.log(`💡 Trying alternative path: public/guestlist.json`);
      
      // Try alternative path
      const altPath = join(__dirname, '../../public/guestlist.json');
      try {
        const fileContent = readFileSync(altPath, 'utf-8');
        guestlistData = JSON.parse(fileContent);
        console.log(`✅ Found guestlist at alternative path`);
      } catch (altError) {
        throw new Error(`Could not find guestlist.json in either location`);
      }
    }
    
    if (!Array.isArray(guestlistData)) {
      throw new Error('Guestlist data must be an array');
    }
    
    console.log(`📋 Found ${guestlistData.length} guests in JSON file`);
    
    // Get existing guests from database
    const existingGuests = await db.collection('guestlist').find({}).toArray();
    const existingNames = new Set(existingGuests.map(g => g.name.toLowerCase()));
    
    console.log(`📊 Found ${existingGuests.length} existing guests in database`);
    
    // Filter out duplicates and prepare new guests
    const newGuests = guestlistData
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .filter(name => !existingNames.has(name.toLowerCase()))
      .map(name => ({
        name: name,
        createdAt: new Date().toISOString(),
        migrated: true
      }));
    
    console.log(`✨ ${newGuests.length} new guests to add`);
    
    if (newGuests.length > 0) {
      // Insert new guests
      const result = await db.collection('guestlist').insertMany(newGuests);
      console.log(`✅ Successfully added ${result.insertedCount} guests to database`);
    } else {
      console.log(`ℹ️  No new guests to add (all guests already exist in database)`);
    }
    
    // Show summary
    const totalGuests = await db.collection('guestlist').countDocuments();
    console.log(`\n📊 Migration Summary:`);
    console.log(`   Total guests in database: ${totalGuests}`);
    console.log(`   Guests from JSON file: ${guestlistData.length}`);
    console.log(`   New guests added: ${newGuests.length}`);
    console.log(`   Existing guests: ${existingGuests.length}`);
    
    // Show sample of added guests
    if (newGuests.length > 0) {
      console.log(`\n📝 Sample of added guests (first 10):`);
      newGuests.slice(0, 10).forEach((guest, index) => {
        console.log(`   ${index + 1}. ${guest.name}`);
      });
      if (newGuests.length > 10) {
        console.log(`   ... and ${newGuests.length - 10} more`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error migrating guestlist:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
}

migrateGuestlist();

