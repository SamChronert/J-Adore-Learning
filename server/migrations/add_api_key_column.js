const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, '../../data/sipschool.db');

// Encryption key - in production, this should be from environment variables
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || crypto.scryptSync('sipschool-default-key', 'salt', 32);
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

async function runMigration() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }

      console.log('Connected to database for migration');

      // Add api_key_encrypted column to users table
      db.run(`ALTER TABLE users ADD COLUMN api_key_encrypted TEXT`, (err) => {
        if (err) {
          if (err.message.includes('duplicate column name')) {
            console.log('Column api_key_encrypted already exists');
            db.close();
            resolve();
          } else {
            console.error('Error adding api_key_encrypted column:', err);
            db.close();
            reject(err);
          }
        } else {
          console.log('Successfully added api_key_encrypted column');
          db.close();
          resolve();
        }
      });
    });
  });
}

// Run the migration
runMigration()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });