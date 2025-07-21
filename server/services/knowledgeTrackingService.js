const database = require('../database');

class KnowledgeTrackingService {
  constructor() {
    this.MASTERY_THRESHOLD = 0.8; // 80% mastery considered proficient
    this.LEARNING_RATE = 0.1; // How quickly mastery changes
    this.CONFIDENCE_DECAY = 0.95; // Confidence decays over time
  }

  /**
   * Update user's knowledge after answering a question
   * @param {number} userId 
   * @param {number} questionId 
   * @param {boolean} isCorrect 
   * @param {number} timeSpent - seconds spent on question
   * @param {boolean} hintUsed 
   */
  async updateKnowledge(userId, questionId, isCorrect, timeSpent = 0, hintUsed = false) {
    try {
      // Get concepts associated with this question
      const concepts = await this.getQuestionConcepts(questionId);
      
      for (const concept of concepts) {
        await this.updateConceptMastery(userId, concept.id, isCorrect, concept.weight, hintUsed);
      }

      // Update learning velocity
      await this.updateLearningVelocity(userId);
      
      // Identify knowledge gaps
      await this.identifyKnowledgeGaps(userId);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating knowledge:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update mastery level for a specific concept
   */
  async updateConceptMastery(userId, conceptId, isCorrect, weight = 1.0, hintUsed = false) {
    return new Promise((resolve, reject) => {
      // First, get current mastery level
      database.db.get(
        `SELECT * FROM user_knowledge WHERE user_id = ? AND concept_id = ?`,
        [userId, conceptId],
        async (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          const currentMastery = row?.mastery_level || 0.0;
          const timesSeen = (row?.times_seen || 0) + 1;
          const timesCorrect = (row?.times_correct || 0) + (isCorrect ? 1 : 0);
          
          // Calculate new mastery using exponential moving average
          const performanceScore = isCorrect ? (hintUsed ? 0.7 : 1.0) : 0.0;
          const newMastery = currentMastery + this.LEARNING_RATE * weight * (performanceScore - currentMastery);
          
          // Calculate confidence score based on number of interactions
          const confidence = Math.min(1.0, timesSeen / 10) * this.CONFIDENCE_DECAY;
          
          // Calculate learning velocity (rate of improvement)
          const successRate = timesSeen > 0 ? timesCorrect / timesSeen : 0;
          const velocity = successRate * confidence;

          if (row) {
            // Update existing record
            database.db.run(
              `UPDATE user_knowledge 
               SET mastery_level = ?, 
                   times_seen = ?, 
                   times_correct = ?,
                   learning_velocity = ?,
                   confidence_score = ?,
                   last_seen = CURRENT_TIMESTAMP,
                   updated_at = CURRENT_TIMESTAMP
               WHERE user_id = ? AND concept_id = ?`,
              [newMastery, timesSeen, timesCorrect, velocity, confidence, userId, conceptId],
              (err) => {
                if (err) reject(err);
                else resolve({ mastery: newMastery, velocity });
              }
            );
          } else {
            // Insert new record
            database.db.run(
              `INSERT INTO user_knowledge 
               (user_id, concept_id, mastery_level, times_seen, times_correct, 
                learning_velocity, confidence_score, last_seen)
               VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
              [userId, conceptId, newMastery, timesSeen, timesCorrect, velocity, confidence],
              (err) => {
                if (err) reject(err);
                else resolve({ mastery: newMastery, velocity });
              }
            );
          }
        }
      );
    });
  }

  /**
   * Get concepts associated with a question
   */
  async getQuestionConcepts(questionId) {
    return new Promise((resolve, reject) => {
      database.db.all(
        `SELECT c.*, qc.weight 
         FROM concepts c
         JOIN question_concepts qc ON c.id = qc.concept_id
         WHERE qc.question_id = ?`,
        [questionId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  /**
   * Calculate overall learning velocity for a user
   */
  async updateLearningVelocity(userId) {
    return new Promise((resolve, reject) => {
      database.db.get(
        `SELECT AVG(learning_velocity) as avg_velocity,
                AVG(mastery_level) as avg_mastery,
                COUNT(*) as concepts_studied
         FROM user_knowledge
         WHERE user_id = ? AND last_seen > datetime('now', '-30 days')`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  /**
   * Identify knowledge gaps for a user
   */
  async identifyKnowledgeGaps(userId) {
    return new Promise((resolve, reject) => {
      // Find concepts with low mastery that are prerequisites for mastered concepts
      database.db.all(
        `SELECT DISTINCT c.*, uk.mastery_level, uk.times_seen
         FROM concepts c
         LEFT JOIN user_knowledge uk ON c.id = uk.concept_id AND uk.user_id = ?
         WHERE (uk.mastery_level < ? OR uk.mastery_level IS NULL)
         AND EXISTS (
           SELECT 1 FROM concept_relationships cr
           JOIN user_knowledge uk2 ON cr.concept_id = uk2.concept_id
           WHERE cr.related_concept_id = c.id 
           AND cr.relationship_type = 'prerequisite'
           AND uk2.user_id = ?
           AND uk2.mastery_level > ?
         )
         ORDER BY COALESCE(uk.mastery_level, 0) ASC
         LIMIT 5`,
        [userId, this.MASTERY_THRESHOLD, userId, this.MASTERY_THRESHOLD],
        async (err, gaps) => {
          if (err) {
            reject(err);
            return;
          }

          // Record identified gaps
          for (const gap of gaps) {
            const gapScore = 1.0 - (gap.mastery_level || 0);
            await this.recordKnowledgeGap(userId, gap.id, gapScore);
          }

          resolve(gaps);
        }
      );
    });
  }

  /**
   * Record a knowledge gap
   */
  async recordKnowledgeGap(userId, conceptId, gapScore) {
    return new Promise((resolve, reject) => {
      database.db.run(
        `INSERT OR REPLACE INTO knowledge_gaps 
         (user_id, concept_id, gap_score, identified_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [userId, conceptId, gapScore],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  /**
   * Get user's knowledge profile
   */
  async getUserKnowledgeProfile(userId) {
    return new Promise((resolve, reject) => {
      const profile = {
        overallMastery: 0,
        strongConcepts: [],
        weakConcepts: [],
        knowledgeGaps: [],
        learningVelocity: 0,
        conceptsStudied: 0
      };

      // Get overall stats
      database.db.get(
        `SELECT AVG(mastery_level) as avg_mastery,
                AVG(learning_velocity) as avg_velocity,
                COUNT(*) as concepts_studied
         FROM user_knowledge
         WHERE user_id = ?`,
        [userId],
        (err, stats) => {
          if (err) {
            reject(err);
            return;
          }

          profile.overallMastery = stats.avg_mastery || 0;
          profile.learningVelocity = stats.avg_velocity || 0;
          profile.conceptsStudied = stats.concepts_studied || 0;

          // Get strong concepts
          database.db.all(
            `SELECT c.*, uk.mastery_level, uk.confidence_score
             FROM user_knowledge uk
             JOIN concepts c ON uk.concept_id = c.id
             WHERE uk.user_id = ? AND uk.mastery_level >= ?
             ORDER BY uk.mastery_level DESC
             LIMIT 10`,
            [userId, this.MASTERY_THRESHOLD],
            (err, strong) => {
              if (!err) profile.strongConcepts = strong || [];

              // Get weak concepts
              database.db.all(
                `SELECT c.*, uk.mastery_level, uk.times_seen
                 FROM user_knowledge uk
                 JOIN concepts c ON uk.concept_id = c.id
                 WHERE uk.user_id = ? AND uk.mastery_level < ? AND uk.times_seen > 2
                 ORDER BY uk.mastery_level ASC
                 LIMIT 10`,
                [userId, 0.5],
                (err, weak) => {
                  if (!err) profile.weakConcepts = weak || [];

                  // Get knowledge gaps
                  database.db.all(
                    `SELECT c.*, kg.gap_score
                     FROM knowledge_gaps kg
                     JOIN concepts c ON kg.concept_id = c.id
                     WHERE kg.user_id = ? AND kg.addressed_at IS NULL
                     ORDER BY kg.gap_score DESC
                     LIMIT 5`,
                    [userId],
                    (err, gaps) => {
                      if (!err) profile.knowledgeGaps = gaps || [];
                      resolve(profile);
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  }

  /**
   * Get recommended concepts for study based on knowledge gaps and learning path
   */
  async getRecommendedConcepts(userId, limit = 5) {
    return new Promise((resolve, reject) => {
      database.db.all(
        `WITH user_stats AS (
          SELECT AVG(mastery_level) as avg_mastery
          FROM user_knowledge
          WHERE user_id = ?
        )
        SELECT c.*, 
               COALESCE(uk.mastery_level, 0) as current_mastery,
               COALESCE(uk.times_seen, 0) as times_seen,
               COALESCE(kg.gap_score, 0) as gap_score,
               CASE 
                 WHEN kg.gap_score IS NOT NULL THEN 3
                 WHEN uk.mastery_level IS NULL THEN 2
                 WHEN uk.mastery_level < (SELECT avg_mastery FROM user_stats) THEN 1
                 ELSE 0
               END as priority
        FROM concepts c
        LEFT JOIN user_knowledge uk ON c.id = uk.concept_id AND uk.user_id = ?
        LEFT JOIN knowledge_gaps kg ON c.id = kg.concept_id AND kg.user_id = ? AND kg.addressed_at IS NULL
        WHERE uk.mastery_level IS NULL 
           OR uk.mastery_level < ?
           OR kg.gap_score IS NOT NULL
        ORDER BY priority DESC, COALESCE(uk.mastery_level, 0) ASC
        LIMIT ?`,
        [userId, userId, userId, this.MASTERY_THRESHOLD, limit],
        (err, concepts) => {
          if (err) reject(err);
          else resolve(concepts || []);
        }
      );
    });
  }

  /**
   * Mark a knowledge gap as addressed
   */
  async markGapAddressed(userId, conceptId) {
    return new Promise((resolve, reject) => {
      database.db.run(
        `UPDATE knowledge_gaps 
         SET addressed_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND concept_id = ? AND addressed_at IS NULL`,
        [userId, conceptId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
}

module.exports = new KnowledgeTrackingService();