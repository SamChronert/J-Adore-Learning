const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.message || 'Request failed');
    }

    return response.json();
  }

  // Authentication endpoints
  async login(username, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async register(username, email, password) {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async loginAsGuest() {
    const response = await this.request('/api/auth/guest', {
      method: 'POST',
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  // Question endpoints
  async getQuestions() {
    return this.request('/api/questions');
  }

  // Claude AI endpoints
  async generateQuestion(category, difficulty, userWeaknesses = []) {
    try {
      return await this.request('/api/questions/generate', {
        method: 'POST',
        body: JSON.stringify({ category, difficulty, userWeaknesses }),
      });
    } catch (error) {
      console.warn('AI generation failed, using fallback:', error.message);
      // Return null to indicate fallback should be used
      return null;
    }
  }

  async generateBatchQuestions(specifications) {
    try {
      return await this.request('/api/questions/generate-batch', {
        method: 'POST',
        body: JSON.stringify({ specifications }),
      });
    } catch (error) {
      console.warn('Batch AI generation failed:', error.message);
      return { questions: [], generated: 0 };
    }
  }

  // Progress endpoints
  async getProgress() {
    return this.request('/api/progress');
  }

  async updateProgress(questionId, isCorrect, category, difficulty, sessionId, spacedRepetition = {}) {
    return this.request('/api/progress/update', {
      method: 'POST',
      body: JSON.stringify({
        questionId,
        isCorrect,
        category,
        difficulty,
        sessionId,
        ...spacedRepetition,
      }),
    });
  }

  async getDueQuestions() {
    return this.request('/api/progress/due');
  }

  // User profile
  async getUserProfile() {
    return this.request('/api/user/profile');
  }

  // Placement test
  async completePlacementTest(level, score, categoryScores) {
    return this.request('/api/placement/complete', {
      method: 'POST',
      body: JSON.stringify({ level, score, categoryScores }),
    });
  }

  async resetPlacementTest() {
    return this.request('/api/placement/reset', {
      method: 'POST',
    });
  }

  // Statistics
  async getStats() {
    return this.request('/api/stats');
  }

  // Study sessions
  async startSession() {
    return this.request('/api/sessions/start', {
      method: 'POST',
    });
  }

  async endSession(sessionId, questionsAnswered, correctAnswers, categoriesStudied) {
    return this.request(`/api/sessions/${sessionId}/end`, {
      method: 'POST',
      body: JSON.stringify({
        questionsAnswered,
        correctAnswers,
        categoriesStudied,
      }),
    });
  }

  // Feedback endpoints
  async submitFeedback(questionId, questionType, rating, feedbackType, comment) {
    return this.request('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        questionId,
        questionType,
        rating,
        feedbackType,
        comment,
      }),
    });
  }

  async getFeedbackForQuestion(questionId) {
    return this.request(`/api/feedback/question/${questionId}`);
  }

  async getFeedbackStats() {
    return this.request('/api/feedback/stats');
  }

  // Admin feedback methods
  async getAllFeedback(filters = {}) {
    const params = new URLSearchParams();
    if (filters.unreviewed) params.append('unreviewed', 'true');
    if (filters.flagged) params.append('flagged', 'true');
    if (filters.type) params.append('type', filters.type);
    if (filters.minRating) params.append('minRating', filters.minRating);
    if (filters.limit) params.append('limit', filters.limit);
    
    return this.request(`/api/admin/feedback?${params.toString()}`);
  }

  async markFeedbackReviewed(feedbackId, adminNotes) {
    return this.request(`/api/admin/feedback/${feedbackId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ adminNotes }),
    });
  }

  async toggleFeedbackFlag(feedbackId) {
    return this.request(`/api/admin/feedback/${feedbackId}/flag`, {
      method: 'PUT',
    });
  }

  // Utility method to analyze user weaknesses
  analyzeUserWeaknesses(progress) {
    const categoryStats = {};
    
    // Aggregate stats by category
    Object.values(progress).forEach(item => {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = {
          correct: 0,
          incorrect: 0,
          total: 0,
          accuracy: 0,
        };
      }
      
      categoryStats[item.category].total++;
      if (item.correct) {
        categoryStats[item.category].correct++;
      } else {
        categoryStats[item.category].incorrect++;
      }
    });

    // Calculate accuracy and identify weaknesses
    const weaknesses = [];
    Object.entries(categoryStats).forEach(([category, stats]) => {
      stats.accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
      
      // Consider a category weak if accuracy is below 60% and at least 3 questions attempted
      if (stats.accuracy < 60 && stats.total >= 3) {
        weaknesses.push(category);
      }
    });

    return {
      categoryStats,
      weaknesses,
    };
  }
}

export default new ApiService();