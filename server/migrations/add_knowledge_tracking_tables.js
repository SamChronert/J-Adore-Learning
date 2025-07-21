const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../data/sipschool.db');

async function runMigration() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }

      console.log('Connected to database for migration');

      // Create tables in sequence
      db.serialize(() => {
        // Concepts table - stores all wine concepts
        db.run(`CREATE TABLE IF NOT EXISTS concepts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          parent_concept_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_concept_id) REFERENCES concepts(id)
        )`, (err) => {
          if (err) {
            console.error('Error creating concepts table:', err);
          } else {
            console.log('Created concepts table');
          }
        });

        // User knowledge table - tracks user's mastery of concepts
        db.run(`CREATE TABLE IF NOT EXISTS user_knowledge (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          concept_id INTEGER NOT NULL,
          mastery_level REAL DEFAULT 0.0,
          last_seen DATETIME,
          times_seen INTEGER DEFAULT 0,
          times_correct INTEGER DEFAULT 0,
          learning_velocity REAL DEFAULT 0.0,
          confidence_score REAL DEFAULT 0.0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (concept_id) REFERENCES concepts(id),
          UNIQUE(user_id, concept_id)
        )`, (err) => {
          if (err) {
            console.error('Error creating user_knowledge table:', err);
          } else {
            console.log('Created user_knowledge table');
          }
        });

        // Concept relationships table - maps relationships between concepts
        db.run(`CREATE TABLE IF NOT EXISTS concept_relationships (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          concept_id INTEGER NOT NULL,
          related_concept_id INTEGER NOT NULL,
          relationship_type TEXT NOT NULL, -- 'prerequisite', 'related', 'subtopic'
          strength REAL DEFAULT 1.0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (concept_id) REFERENCES concepts(id),
          FOREIGN KEY (related_concept_id) REFERENCES concepts(id),
          UNIQUE(concept_id, related_concept_id, relationship_type)
        )`, (err) => {
          if (err) {
            console.error('Error creating concept_relationships table:', err);
          } else {
            console.log('Created concept_relationships table');
          }
        });

        // Question concepts mapping - maps questions to concepts
        db.run(`CREATE TABLE IF NOT EXISTS question_concepts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          question_id INTEGER NOT NULL,
          concept_id INTEGER NOT NULL,
          weight REAL DEFAULT 1.0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (concept_id) REFERENCES concepts(id),
          UNIQUE(question_id, concept_id)
        )`, (err) => {
          if (err) {
            console.error('Error creating question_concepts table:', err);
          } else {
            console.log('Created question_concepts table');
          }
        });

        // Learning sessions enhanced - track concept focus
        db.run(`CREATE TABLE IF NOT EXISTS learning_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          session_id INTEGER NOT NULL,
          concept_id INTEGER NOT NULL,
          questions_attempted INTEGER DEFAULT 0,
          questions_correct INTEGER DEFAULT 0,
          time_spent INTEGER DEFAULT 0, -- in seconds
          mastery_before REAL,
          mastery_after REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (session_id) REFERENCES study_sessions(id),
          FOREIGN KEY (concept_id) REFERENCES concepts(id)
        )`, (err) => {
          if (err) {
            console.error('Error creating learning_sessions table:', err);
          } else {
            console.log('Created learning_sessions table');
          }
        });

        // Knowledge gaps table - identifies areas needing improvement
        db.run(`CREATE TABLE IF NOT EXISTS knowledge_gaps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          concept_id INTEGER NOT NULL,
          gap_score REAL NOT NULL, -- higher score = bigger gap
          identified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          addressed_at DATETIME,
          improvement_plan TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (concept_id) REFERENCES concepts(id)
        )`, (err) => {
          if (err) {
            console.error('Error creating knowledge_gaps table:', err);
          } else {
            console.log('Created knowledge_gaps table');
          }
        });

        // Create indexes for performance
        db.run(`CREATE INDEX IF NOT EXISTS idx_user_knowledge_user_concept 
                ON user_knowledge(user_id, concept_id)`, (err) => {
          if (err) console.error('Error creating index:', err);
        });

        db.run(`CREATE INDEX IF NOT EXISTS idx_question_concepts_question 
                ON question_concepts(question_id)`, (err) => {
          if (err) console.error('Error creating index:', err);
        });

        db.run(`CREATE INDEX IF NOT EXISTS idx_knowledge_gaps_user_score 
                ON knowledge_gaps(user_id, gap_score DESC)`, (err) => {
          if (err) console.error('Error creating index:', err);
        });

        // Close database after all operations
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
            reject(err);
          } else {
            console.log('Migration completed successfully');
            resolve();
          }
        });
      });
    });
  });
}

// Run the migration
runMigration()
  .then(() => {
    console.log('Knowledge tracking tables created successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });