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

  async init() {
    return this.connect();
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
          settings JSON DEFAULT '{}',
          placement_completed BOOLEAN DEFAULT FALSE,
          placement_level TEXT,
          placement_score INTEGER
        )`,

        // User progress table - Enhanced with spaced repetition fields
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
        )`,

        // Question feedback table
        `CREATE TABLE IF NOT EXISTS question_feedback (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          question_id TEXT NOT NULL,
          question_type TEXT DEFAULT 'static', -- 'static' or 'ai_generated'
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          feedback_type TEXT, -- 'difficulty', 'clarity', 'answer_issue', 'other'
          comment TEXT,
          is_flagged BOOLEAN DEFAULT FALSE,
          admin_reviewed BOOLEAN DEFAULT FALSE,
          admin_notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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

  async updatePlacementTestStatus(userId, completed, level = null, score = null) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE users SET placement_completed = ?, placement_level = ?, placement_score = ? WHERE id = ?`;
      this.db.run(sql, [completed ? 1 : 0, level, score, userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getUserById(userId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE id = ?`;
      this.db.get(sql, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
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
          const { nextReview, newInterval, newEaseFactor } = this.calculateSpacedRepetition(row, isCorrect);
          
          const updateSql = `
            UPDATE user_progress 
            SET attempts = ?, correct_count = ?, last_attempt = ?, 
                next_review = ?, interval_days = ?, ease_factor = ?
            WHERE user_id = ? AND question_id = ?
          `;
          
          this.db.run(updateSql, [
            newAttempts, newCorrect, now, nextReview, newInterval, newEaseFactor, 
            userId, questionId
          ], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        } else {
          // Create new progress record
          const { nextReview, newInterval, newEaseFactor } = this.calculateSpacedRepetition(null, isCorrect);
          
          const insertSql = `
            INSERT INTO user_progress 
            (user_id, question_id, attempts, correct_count, first_attempt, last_attempt, 
             category, difficulty, next_review, interval_days, ease_factor)
            VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          this.db.run(insertSql, [
            userId, questionId, isCorrect ? 1 : 0, now, now, 
            category, difficulty, nextReview, newInterval, newEaseFactor
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

  // Enhanced update method with spaced repetition
  async updateUserProgressWithSpacedRepetition(userId, questionId, isCorrect, category, difficulty, easeFactor, interval, nextReview) {
    return new Promise((resolve, reject) => {
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
          
          const updateSql = `
            UPDATE user_progress 
            SET attempts = ?, correct_count = ?, last_attempt = ?, 
                next_review = ?, interval_days = ?, ease_factor = ?
            WHERE user_id = ? AND question_id = ?
          `;
          
          this.db.run(updateSql, [
            newAttempts, newCorrect, now, nextReview, interval, easeFactor,
            userId, questionId
          ], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        } else {
          // Create new progress record
          const insertSql = `
            INSERT INTO user_progress 
            (user_id, question_id, attempts, correct_count, first_attempt, last_attempt, 
             category, difficulty, next_review, interval_days, ease_factor)
            VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          this.db.run(insertSql, [
            userId, questionId, isCorrect ? 1 : 0, now, now,
            category, difficulty, nextReview, interval, easeFactor
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

  calculateSpacedRepetition(currentProgress, isCorrect) {
    let interval = 1;
    let easeFactor = 2.5;
    
    if (currentProgress) {
      interval = currentProgress.interval_days || 1;
      easeFactor = currentProgress.ease_factor || 2.5;
      
      if (isCorrect) {
        // SM-2 algorithm: increase interval
        interval = Math.round(interval * easeFactor);
        easeFactor = Math.min(easeFactor + 0.1, 3.0);
      } else {
        // Failed: reset interval
        interval = 1;
        easeFactor = Math.max(easeFactor - 0.3, 1.3);
      }
    } else {
      // First time seeing this question
      interval = isCorrect ? 1 : 0.5;
    }
    
    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    
    return {
      nextReview: nextReview.toISOString(),
      newInterval: interval,
      newEaseFactor: easeFactor
    };
  }

  async getUserProgress(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT question_id, attempts, correct_count, last_attempt, 
               category, difficulty, next_review, ease_factor, interval_days
        FROM user_progress 
        WHERE user_id = ?
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

  async getDueQuestions(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT question_id, category, difficulty, next_review, ease_factor, interval_days
        FROM user_progress 
        WHERE user_id = ? AND next_review <= datetime('now')
        ORDER BY next_review ASC
        LIMIT 50
      `;
      
      this.db.all(sql, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => ({ id: row.question_id, ...row })));
        }
      });
    });
  }

  async getUserStatistics(userId) {
    return new Promise((resolve, reject) => {
      const statsPromises = [
        // Total questions answered
        new Promise((res, rej) => {
          this.db.get(
            `SELECT SUM(attempts) as total_attempts, 
                    SUM(correct_count) as total_correct
             FROM user_progress WHERE user_id = ?`,
            [userId],
            (err, row) => err ? rej(err) : res(row)
          );
        }),
        
        // Category breakdown
        new Promise((res, rej) => {
          this.db.all(
            `SELECT category, 
                    COUNT(*) as questions_seen,
                    SUM(attempts) as attempts,
                    SUM(correct_count) as correct,
                    AVG(ease_factor) as avg_ease_factor
             FROM user_progress 
             WHERE user_id = ? 
             GROUP BY category`,
            [userId],
            (err, rows) => err ? rej(err) : res(rows)
          );
        }),
        
        // Study sessions
        new Promise((res, rej) => {
          this.db.all(
            `SELECT COUNT(*) as total_sessions,
                    AVG(questions_answered) as avg_questions_per_session,
                    AVG(CAST(correct_answers AS FLOAT) / NULLIF(questions_answered, 0)) as avg_accuracy
             FROM study_sessions 
             WHERE user_id = ? AND ended_at IS NOT NULL`,
            [userId],
            (err, row) => err ? rej(err) : res(row)
          );
        }),
        
        // Questions due
        new Promise((res, rej) => {
          this.db.get(
            `SELECT COUNT(*) as questions_due
             FROM user_progress 
             WHERE user_id = ? AND next_review <= datetime('now')`,
            [userId],
            (err, row) => err ? rej(err) : res(row)
          );
        })
      ];
      
      Promise.all(statsPromises)
        .then(([totals, categories, sessions, due]) => {
          const accuracy = totals.total_attempts > 0 
            ? Math.round((totals.total_correct / totals.total_attempts) * 100) 
            : 0;
            
          resolve({
            totalQuestionsAnswered: totals.total_attempts || 0,
            totalCorrect: totals.total_correct || 0,
            overallAccuracy: accuracy,
            categoryBreakdown: categories,
            sessionStats: sessions,
            questionsDue: due.questions_due || 0,
            lastStudied: new Date().toISOString() // This could be improved
          });
        })
        .catch(reject);
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

  async recordPlacementTest(userId, totalQuestions, correctAnswers, categoryScores, determinedLevel) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO placement_tests (user_id, total_questions, correct_answers, category_scores, determined_level)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [
        userId, 
        totalQuestions, 
        correctAnswers, 
        JSON.stringify(categoryScores), 
        determinedLevel
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  // Feedback methods
  async submitFeedback(userId, questionId, questionType, rating, feedbackType, comment) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO question_feedback 
        (user_id, question_id, question_type, rating, feedback_type, comment)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [userId, questionId, questionType, rating, feedbackType, comment], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  async getFeedbackForQuestion(questionId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          qf.*,
          u.username
        FROM question_feedback qf
        JOIN users u ON qf.user_id = u.id
        WHERE qf.question_id = ?
        ORDER BY qf.created_at DESC
      `;
      
      this.db.all(sql, [questionId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getAllFeedback(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          qf.*,
          u.username
        FROM question_feedback qf
        JOIN users u ON qf.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.isUnreviewed) {
        sql += ' AND qf.admin_reviewed = FALSE';
      }
      if (filters.isFlagged) {
        sql += ' AND qf.is_flagged = TRUE';
      }
      if (filters.feedbackType) {
        sql += ' AND qf.feedback_type = ?';
        params.push(filters.feedbackType);
      }
      if (filters.minRating) {
        sql += ' AND qf.rating <= ?';
        params.push(filters.minRating);
      }

      sql += ' ORDER BY qf.created_at DESC';

      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(filters.limit);
      }
      
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getFeedbackStats() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total_feedback,
          AVG(rating) as average_rating,
          COUNT(CASE WHEN is_flagged = TRUE THEN 1 END) as flagged_count,
          COUNT(CASE WHEN admin_reviewed = FALSE THEN 1 END) as unreviewed_count,
          COUNT(CASE WHEN feedback_type = 'answer_issue' THEN 1 END) as answer_issues,
          COUNT(CASE WHEN feedback_type = 'difficulty' THEN 1 END) as difficulty_feedback,
          COUNT(CASE WHEN feedback_type = 'clarity' THEN 1 END) as clarity_feedback
        FROM question_feedback
      `;
      
      this.db.get(sql, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async markFeedbackReviewed(feedbackId, adminNotes = null) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE question_feedback 
        SET admin_reviewed = TRUE, admin_notes = ?
        WHERE id = ?
      `;
      
      this.db.run(sql, [adminNotes, feedbackId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async toggleFeedbackFlag(feedbackId) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE question_feedback 
        SET is_flagged = NOT is_flagged
        WHERE id = ?
      `;
      
      this.db.run(sql, [feedbackId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // API Key management
  async updateUserApiKey(userId, encryptedApiKey) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE users SET api_key_encrypted = ? WHERE id = ?`;
      
      this.db.run(sql, [encryptedApiKey, userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getUserApiKey(userId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT api_key_encrypted FROM users WHERE id = ?`;
      
      this.db.get(sql, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row?.api_key_encrypted || null);
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
