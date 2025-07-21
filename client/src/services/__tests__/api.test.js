import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api from '../api';

describe('ApiService', () => {
  const mockToken = 'test-jwt-token';
  const mockUser = { id: 1, username: 'testuser' };

  beforeEach(() => {
    // Reset fetch mock
    global.fetch = vi.fn();
    // Clear localStorage
    localStorage.clear();
    // Reset API token
    api.setToken(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('setToken', () => {
    it('should store token in localStorage', () => {
      api.setToken(mockToken);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
      expect(api.token).toBe(mockToken);
    });

    it('should remove token when null is passed', () => {
      api.setToken(null);
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(api.token).toBeNull();
    });
  });

  describe('request', () => {
    it('should make authenticated request with token', async () => {
      api.setToken(mockToken);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await api.request('/api/test');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('should handle request errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad request' }),
      });

      await expect(api.request('/api/test')).rejects.toThrow('Bad request');
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.request('/api/test')).rejects.toThrow('Network error');
    });
  });

  describe('Authentication methods', () => {
    it('should login successfully', async () => {
      const credentials = { username: 'testuser', password: 'password123' };
      const response = { token: mockToken, user: mockUser };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      });

      const result = await api.login(credentials.username, credentials.password);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(credentials),
        })
      );
      expect(result).toEqual(response);
      expect(api.token).toBe(mockToken);
    });

    it('should register successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };
      const response = { token: mockToken, user: mockUser };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      });

      const result = await api.register(
        userData.username,
        userData.email,
        userData.password
      );

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(userData),
        })
      );
      expect(result).toEqual(response);
    });

    it('should login as guest', async () => {
      const response = {
        token: 'guest-token',
        user: { id: 'guest_123', username: 'Guest', isGuest: true },
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      });

      const result = await api.loginAsGuest();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/guest',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual(response);
    });
  });

  describe('Claude API methods', () => {
    beforeEach(() => {
      api.setToken(mockToken);
    });

    it('should generate question successfully', async () => {
      const questionData = {
        question: 'What grape is used in Chablis?',
        answer: 'Chardonnay',
        category: 'Wine Regions',
        difficulty: 'intermediate',
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => questionData,
      });

      const result = await api.generateQuestion(
        'Wine Regions',
        'intermediate',
        ['French wines']
      );

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/questions/generate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            category: 'Wine Regions',
            difficulty: 'intermediate',
            userWeaknesses: ['French wines'],
          }),
        })
      );
      expect(result).toEqual(questionData);
    });

    it('should return null on generation failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ error: 'Service unavailable' }),
      });

      const result = await api.generateQuestion('Wine Regions', 'easy');

      expect(result).toBeNull();
    });

    it('should generate batch questions', async () => {
      const specifications = [
        { category: 'Grape Varieties', difficulty: 'easy' },
        { category: 'Wine Service', difficulty: 'hard' },
      ];
      const response = {
        questions: [
          { question: 'Q1', category: 'Grape Varieties' },
          { question: 'Q2', category: 'Wine Service' },
        ],
        generated: 2,
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      });

      const result = await api.generateBatchQuestions(specifications);

      expect(result).toEqual(response);
    });
  });

  describe('analyzeUserWeaknesses', () => {
    it('should identify weak categories', () => {
      const progress = {
        q_1: { category: 'Wine Regions', correct: true },
        q_2: { category: 'Wine Regions', correct: false },
        q_3: { category: 'Wine Regions', correct: false },
        q_4: { category: 'Wine Regions', correct: false },
        q_5: { category: 'Grape Varieties', correct: true },
        q_6: { category: 'Grape Varieties', correct: true },
        q_7: { category: 'Grape Varieties', correct: true },
      };

      const result = api.analyzeUserWeaknesses(progress);

      expect(result.weaknesses).toContain('Wine Regions');
      expect(result.weaknesses).not.toContain('Grape Varieties');
      expect(result.categoryStats['Wine Regions'].accuracy).toBe(25);
      expect(result.categoryStats['Grape Varieties'].accuracy).toBe(100);
    });

    it('should require minimum attempts to identify weakness', () => {
      const progress = {
        q_1: { category: 'Wine Regions', correct: false },
        q_2: { category: 'Wine Regions', correct: false },
        // Only 2 attempts, need at least 3
      };

      const result = api.analyzeUserWeaknesses(progress);

      expect(result.weaknesses).toHaveLength(0);
    });

    it('should handle empty progress', () => {
      const result = api.analyzeUserWeaknesses({});

      expect(result.weaknesses).toHaveLength(0);
      expect(result.categoryStats).toEqual({});
    });
  });

  describe('Progress and Stats methods', () => {
    beforeEach(() => {
      api.setToken(mockToken);
    });

    it('should update progress with spaced repetition', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.updateProgress(
        1,
        true,
        'Wine Regions',
        'easy',
        'session123',
        { easeFactor: 2.5, interval: 1, nextReview: '2024-01-01' }
      );

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/progress/update',
        expect.objectContaining({
          body: expect.stringContaining('easeFactor'),
        })
      );
    });

    it('should get due questions', async () => {
      const dueQuestions = [{ id: 1 }, { id: 2 }];
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => dueQuestions,
      });

      const result = await api.getDueQuestions();

      expect(result).toEqual(dueQuestions);
    });
  });
});