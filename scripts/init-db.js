#!/usr/bin/env node

/**
 * SipSchool Database Initialization Script
 * This script sets up the SQLite database with all required tables and indexes
 */

const path = require('path');
const fs = require('fs');
const Database = require('../server/database');

console.log('🚀 SipSchool Database Initialization');
console.log('=====================================\n');

async function initializeDatabase() {
  try {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('✅ Created data directory');
    }

    // Initialize database connection
    const db = new Database();
    await db.init();
    console.log('✅ Database initialized successfully');

    // Create additional indexes for performance
    console.log('\n📊 Creating performance indexes...');
    
    // Index for spaced repetition queries
    await db.db.run(`
      CREATE INDEX IF NOT EXISTS idx_progress_next_review 
      ON user_progress(user_id, next_review)
    `);
    console.log('✅ Created next_review index');

    // Index for category queries
    await db.db.run(`
      CREATE INDEX IF NOT EXISTS idx_progress_category 
      ON user_progress(user_id, category)
    `);
    console.log('✅ Created category index');

    // Index for session queries
    await db.db.run(`
      CREATE INDEX IF NOT EXISTS idx_sessions_user 
      ON study_sessions(user_id, started_at)
    `);
    console.log('✅ Created session index');

    // Create sample data for testing (optional)
    if (process.argv.includes('--sample-data')) {
      console.log('\n📝 Creating sample data...');
      
      // Create a test user
      const testUserId = await db.createUser('wine_lover', 'test123', 'winelover@example.com');
      console.log(`✅ Created test user: wine_lover (ID: ${testUserId})`);

      // Add some progress data
      await db.updateUserProgress(testUserId, 1, true, 'Grape Varieties', 'basic');
      await db.updateUserProgress(testUserId, 2, true, 'Grape Varieties', 'basic');
      await db.updateUserProgress(testUserId, 3, false, 'Grape Varieties', 'intermediate');
      console.log('✅ Added sample progress data');
    }

    // Verify tables exist
    console.log('\n🔍 Verifying database structure...');
    const tables = await db.db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `);
    
    console.log('📋 Tables created:');
    tables.forEach(table => {
      if (!table.name.startsWith('sqlite_')) {
        console.log(`   ✅ ${table.name}`);
      }
    });

    // Get database file size
    const stats = fs.statSync(path.join(dataDir, 'sipschool.db'));
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`\n💾 Database size: ${fileSizeInMB} MB`);

    console.log('\n✨ Database initialization complete!');
    console.log('🍷 SipSchool is ready for wine education!\n');

    // Close the database connection
    await db.close();

  } catch (error) {
    console.error('\n❌ Error initializing database:', error.message);
    process.exit(1);
  }
}

// Add command line options
if (process.argv.includes('--help')) {
  console.log('Usage: node scripts/init-db.js [options]');
  console.log('\nOptions:');
  console.log('  --sample-data    Create sample user and progress data');
  console.log('  --reset          Delete existing database before creating');
  console.log('  --help           Show this help message');
  process.exit(0);
}

// Handle reset option
if (process.argv.includes('--reset')) {
  const dbPath = path.join(__dirname, '..', 'data', 'sipschool.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('⚠️  Deleted existing database');
  }
}

// Run initialization
initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});
