const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'sipschool.db');

class Database {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('📊 Connected to SQLite database');
          this.initializeTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async initializeTables() {
    return new Promise((resolve, reject) => {
      const tables = [
        // Users table
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          email TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME,
          settings JSON DEFAULT '{}'
        )`,

        // User progress table
        `CREATE TABLE IF NOT EXISTS user_progress (
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
        )`,

        // Study sessions table
        `CREATE TABLE IF NOT EXISTS study_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          ended_at DATETIME,
          questions_answered INTEGER DEFAULT 0,
          correct_answers INTEGER DEFAULT 0,
          categories_studied TEXT,
          session_type TEXT DEFAULT 'practice',
          FOREIGN KEY (user_id) REFERENCES users(id)
        )`,

        // Question attempts table (detailed tracking)
        `CREATE TABLE IF NOT EXISTS question_attempts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          question_id INTEGER NOT NULL,
          session_id INTEGER,
          is_correct BOOLEAN NOT NULL,
          time_spent INTEGER, -- in seconds
          hint_used BOOLEAN DEFAULT FALSE,
          answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (session_id) REFERENCES study_sessions(id)
        )`,

        // Placement test results
        `CREATE TABLE IF NOT EXISTS placement_tests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          total_questions INTEGER NOT NULL,
          correct_answers INTEGER NOT NULL,
          category_scores JSON,
          determined_level TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )`
      ];

      let completed = 0;
      const total = tables.length;

      tables.forEach((sql, index) => {
        this.db.run(sql, (err) => {
          if (err) {
            console.error(`Error creating table ${index + 1}:`, err);
            reject(err);
            return;
          }
          
          completed++;
          if (completed === total) {
            console.log(`✅ Initialized ${total} database tables`);
            resolve();
          }
        });
      });
    });
  }

  // User management methods
  async createUser(username, passwordHash, email = null) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)`;
      this.db.run(sql, [username, passwordHash, email], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  async getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE username = ?`;
      this.db.get(sql, [username], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async updateLastLogin(userId) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
      this.db.run(sql, [userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Progress tracking methods
  async updateUserProgress(userId, questionId, isCorrect, category, difficulty) {
    return new Promise((resolve, reject) => {
      // First, get current progress
      const selectSql = `SELECT * FROM user_progress WHERE user_id = ? AND question_id = ?`;
      
      this.db.get(selectSql, [userId, questionId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        const now = new Date().toISOString();
        
        if (row) {
          // Update existing progress
          const newAttempts = row.attempts + 1;
          const newCorrect = row.correct_count + (isCorrect ? 1 : 0);
          
          // Calculate next review using spaced repetition
          const nextReview = this.calculateNextReview(row, isCorrect);
          
          const updateSql = `
            UPDATE user_progress 
            SET attempts = ?, correct_count = ?, last_attempt = ?, next_review = ?
            WHERE user_id = ? AND question_id = ?
          `;
          
          this.db.run(updateSql, [newAttempts, newCorrect, now, nextReview, userId, questionId], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        } else {
          // Create new progress record
          const nextReview = this.calculateNextReview(null, isCorrect);
          
          const insertSql = `
            INSERT INTO user_progress 
            (user_id, question_id, attempts, correct_count, first_attempt, last_attempt, category, difficulty, next_review)
            VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?)
          `;
          
          this.db.run(insertSql, [
            userId, questionId, isCorrect ? 1 : 0, now, now, category, difficulty, nextReview
          ], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  calculateNextReview(currentProgress, isCorrect) {
    if (!currentProgress) {
      // First attempt
      return new Date(Date.now() + (isCorrect ? 1 : 0.5) * 24 * 60 * 60 * 1000).toISOString();
    }

    const intervals = [1, 3, 7, 14, 30, 90]; // days
    let currentInterval = currentProgress.interval_days || 1;
    let easeFactor = currentProgress.ease_factor || 2.5;

    if (isCorrect) {
      // Increase interval
      const nextIntervalIndex = Math.min(
        intervals.findIndex(i => i > currentInterval) + 1,
        intervals.length - 1
      );
      currentInterval = intervals[nextIntervalIndex] || currentInterval * easeFactor;
      easeFactor = Math.max(1.3, easeFactor + 0.1);
    } else {
      // Reset to shorter interval
      currentInterval = Math.max(1, currentInterval * 0.5);
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    }

    return new Date(Date.now() + currentInterval * 24 * 60 * 60 * 1000).toISOString();
  }

  async getUserProgress(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT category, 
               COUNT(*) as total_questions,
               SUM(CASE WHEN attempts > 0 THEN 1 ELSE 0 END) as attempted,
               SUM(correct_count) as total_correct,
               SUM(attempts) as total_attempts
        FROM user_progress 
        WHERE user_id = ? 
        GROUP BY category
      `;
      
      this.db.all(sql, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getQuestionsForReview(userId, limit = 20) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT question_id, category, difficulty, next_review
        FROM user_progress 
        WHERE user_id = ? AND next_review <= CURRENT_TIMESTAMP
        ORDER BY next_review ASC
        LIMIT ?
      `;
      
      this.db.all(sql, [userId, limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async startStudySession(userId, sessionType = 'practice') {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO study_sessions (user_id, session_type)
        VALUES (?, ?)
      `;
      
      this.db.run(sql, [userId, sessionType], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  async endStudySession(sessionId, questionsAnswered, correctAnswers, categoriesStudied) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE study_sessions 
        SET ended_at = CURRENT_TIMESTAMP, 
            questions_answered = ?, 
            correct_answers = ?,
            categories_studied = ?
        WHERE id = ?
      `;
      
      this.db.run(sql, [questionsAnswered, correctAnswers, categoriesStudied.join(','), sessionId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          } else {
            console.log('📊 Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;