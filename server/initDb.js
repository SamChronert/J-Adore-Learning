// Database initialization script for SipSchool
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Database = require('./database');

async function initializeDatabase() {
  console.log('🚀 SipSchool Database Initialization');
  console.log('=====================================\n');

  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('📁 Created data directory');
    }

    // Initialize database connection
    const db = new Database();
    console.log('📊 Connecting to database...');
    
    await db.connect();
    console.log('✅ Database connected successfully\n');

    // Check if tables already exist
    const tablesExist = await db.checkTablesExist();
    
    if (tablesExist) {
      console.log('⚠️  Tables already exist. Do you want to reset the database? (y/N)');
      
      // For automated scripts, skip reset
      if (process.argv.includes('--force')) {
        console.log('🔄 Force flag detected. Resetting database...');
        await db.resetDatabase();
        console.log('✅ Database reset complete\n');
      } else {
        console.log('ℹ️  Skipping reset. Database is ready.');
        process.exit(0);
      }
    }

    console.log('🏗️  Creating database tables...');
    
    // Create users table
    await db.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        settings JSON DEFAULT '{}'
      )
    `);
    console.log('✅ Created users table');

    // Create user_progress table with spaced repetition columns
    await db.db.exec(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        attempts INTEGER DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        first_attempt DATETIME,
        last_attempt DATETIME,
        category TEXT,
        difficulty TEXT,
        next_review DATETIME,
        ease_factor REAL DEFAULT 2.5,
        interval_days INTEGER DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, question_id)
      )
    `);
    console.log('✅ Created user_progress table');

    // Create study_sessions table
    await db.db.exec(`
      CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ended_at DATETIME,
        questions_answered INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        categories_studied JSON,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('✅ Created study_sessions table');

    // Create user_attempts table for detailed tracking
    await db.db.exec(`
      CREATE TABLE IF NOT EXISTS user_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        session_id INTEGER,
        attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_answer TEXT,
        is_correct BOOLEAN,
        time_taken_seconds INTEGER,
        hints_used INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (session_id) REFERENCES study_sessions(id)
      )
    `);
    console.log('✅ Created user_attempts table');

    // Create placement_tests table
    await db.db.exec(`
      CREATE TABLE IF NOT EXISTS placement_tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        calculated_level TEXT NOT NULL,
        question_results JSON,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('✅ Created placement_tests table');

    // Create indices for better performance
    console.log('\n🔍 Creating database indices...');
    
    await db.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_progress_user_id ON user_progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_progress_next_review ON user_progress(next_review);
      CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON user_attempts(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON study_sessions(user_id);
    `);
    console.log('✅ Created database indices');

    // Create a test user (optional)
    if (process.argv.includes('--with-test-user')) {
      console.log('\n👤 Creating test user...');
      const bcrypt = require('bcrypt');
      const testPassword = await bcrypt.hash('test123', 10);
      
      await db.db.run(
        `INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)`,
        ['wine_lover', testPassword, 'test@sipschool.com']
      );
      console.log('✅ Created test user: wine_lover / test123');
    }

    console.log('\n🎉 Database initialization complete!');
    console.log('=====================================');
    console.log('Your SipSchool database is ready to use.');
    console.log('\nNext steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Register a new account or use the test account');
    console.log('3. Start learning about wine!\n');

  } catch (error) {
    console.error('\n❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Add method to check if tables exist
Database.prototype.checkTablesExist = async function() {
  try {
    const result = await this.db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='users'`
    );
    return !!result;
  } catch (error) {
    return false;
  }
};

// Add method to reset database
Database.prototype.resetDatabase = async function() {
  const tables = ['user_attempts', 'placement_tests', 'study_sessions', 'user_progress', 'users'];
  
  for (const table of tables) {
    await this.db.exec(`DROP TABLE IF EXISTS ${table}`);
  }
};

// Run the initialization
initializeDatabase();
