const ClaudeService = require('../../server/services/claudeService');

// Mock the Anthropic SDK
jest.mock('@anthropic-ai/sdk');

describe('ClaudeService', () => {
  let claudeService;
  let mockCreate;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Set up environment
    process.env.CLAUDE_API_KEY = 'test_api_key';
    
    // Mock the Anthropic constructor
    const Anthropic = require('@anthropic-ai/sdk');
    mockCreate = jest.fn();
    
    Anthropic.mockImplementation(() => ({
      messages: {
        create: mockCreate,
      },
    }));
    
    claudeService = new ClaudeService();
  });

  describe('constructor', () => {
    it('should initialize with API key from environment', () => {
      expect(claudeService.client).toBeDefined();
      expect(claudeService.cache).toBeInstanceOf(Map);
      expect(claudeService.cacheTimeout).toBe(3600000); // 1 hour
    });
  });

  describe('generateQuestion', () => {
    const mockResponse = {
      content: [{
        text: JSON.stringify({
          question: "What is the primary grape variety in Chablis?",
          answer: "Chardonnay",
          alternativeAnswers: ["Chard", "Chardonnay grape", "100% Chardonnay"],
          explanation: "Chablis is made exclusively from Chardonnay grapes.",
          category: "Wine Regions",
          difficulty: "intermediate"
        })
      }]
    };

    beforeEach(() => {
      mockCreate.mockResolvedValue(mockResponse);
    });

    it('should generate a question successfully', async () => {
      const result = await claudeService.generateQuestion(
        'Wine Regions',
        'intermediate',
        ['French wines']
      );

      expect(result).toMatchObject({
        question: expect.any(String),
        answer: expect.any(String),
        alternativeAnswers: expect.any(Array),
        explanation: expect.any(String),
        category: 'Wine Regions',
        difficulty: 'intermediate'
      });

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1000,
        temperature: 0.8,
        messages: [{
          role: 'user',
          content: expect.stringContaining('Wine Regions')
        }]
      });
    });

    it('should use cache for repeated requests', async () => {
      // First call
      const result1 = await claudeService.generateQuestion(
        'Wine Regions',
        'intermediate',
        []
      );

      // Second call with same parameters
      const result2 = await claudeService.generateQuestion(
        'Wine Regions',
        'intermediate',
        []
      );

      expect(result1).toEqual(result2);
      expect(mockCreate).toHaveBeenCalledTimes(1); // Only called once due to cache
    });

    it('should handle API errors gracefully', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'));

      await expect(
        claudeService.generateQuestion('Wine Regions', 'easy')
      ).rejects.toThrow('Failed to generate question');
    });

    it('should include user weaknesses in prompt', async () => {
      const weaknesses = ['Bordeaux wines', 'vintage years'];
      
      await claudeService.generateQuestion(
        'Wine Regions',
        'intermediate',
        weaknesses
      );

      expect(mockCreate).toHaveBeenCalledWith({
        model: expect.any(String),
        max_tokens: expect.any(Number),
        temperature: expect.any(Number),
        messages: [{
          role: 'user',
          content: expect.stringContaining('Bordeaux wines')
        }]
      });
    });
  });

  describe('parseResponse', () => {
    it('should parse valid JSON response', () => {
      const responseText = `Here's the question:
      {
        "question": "Test question",
        "answer": "Test answer",
        "alternativeAnswers": ["alt1", "alt2"],
        "explanation": "Test explanation",
        "category": "Test Category",
        "difficulty": "easy"
      }`;

      const result = claudeService.parseResponse(responseText);
      
      expect(result).toMatchObject({
        question: 'Test question',
        answer: 'Test answer',
        alternativeAnswers: ['alt1', 'alt2'],
        explanation: 'Test explanation',
        category: 'Test Category',
        difficulty: 'easy'
      });
    });

    it('should throw error for missing required fields', () => {
      const responseText = JSON.stringify({
        question: "Test question",
        answer: "Test answer"
        // Missing other required fields
      });

      expect(() => {
        claudeService.parseResponse(responseText);
      }).toThrow('Missing required field');
    });

    it('should throw error for invalid JSON', () => {
      const responseText = "This is not JSON";

      expect(() => {
        claudeService.parseResponse(responseText);
      }).toThrow('No JSON found in response');
    });
  });

  describe('generateBatchQuestions', () => {
    it('should generate multiple questions', async () => {
      const mockResponses = [
        {
          content: [{
            text: JSON.stringify({
              question: "Question 1",
              answer: "Answer 1",
              alternativeAnswers: ["alt1"],
              explanation: "Explanation 1",
              category: "Grape Varieties",
              difficulty: "easy"
            })
          }]
        },
        {
          content: [{
            text: JSON.stringify({
              question: "Question 2",
              answer: "Answer 2",
              alternativeAnswers: ["alt2"],
              explanation: "Explanation 2",
              category: "Wine Service",
              difficulty: "intermediate"
            })
          }]
        }
      ];

      mockCreate
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1]);

      const specifications = [
        { category: 'Grape Varieties', difficulty: 'easy' },
        { category: 'Wine Service', difficulty: 'intermediate' }
      ];

      const results = await claudeService.generateBatchQuestions(specifications);

      expect(results).toHaveLength(2);
      expect(results[0].category).toBe('Grape Varieties');
      expect(results[1].category).toBe('Wine Service');
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('should continue on individual failures', async () => {
      mockCreate
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          content: [{
            text: JSON.stringify({
              question: "Question 2",
              answer: "Answer 2",
              alternativeAnswers: ["alt2"],
              explanation: "Explanation 2",
              category: "Wine Service",
              difficulty: "intermediate"
            })
          }]
        });

      const specifications = [
        { category: 'Grape Varieties', difficulty: 'easy' },
        { category: 'Wine Service', difficulty: 'intermediate' }
      ];

      const results = await claudeService.generateBatchQuestions(specifications);

      expect(results).toHaveLength(1);
      expect(results[0].category).toBe('Wine Service');
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', async () => {
      // Generate a question to populate cache
      mockCreate.mockResolvedValue({
        content: [{
          text: JSON.stringify({
            question: "Test",
            answer: "Test",
            alternativeAnswers: [],
            explanation: "Test",
            category: "Test",
            difficulty: "easy"
          })
        }]
      });

      await claudeService.generateQuestion('Test', 'easy');
      expect(claudeService.cache.size).toBe(1);

      claudeService.clearCache();
      expect(claudeService.cache.size).toBe(0);
    });

    it('should get cache statistics', async () => {
      // Generate some questions
      mockCreate.mockResolvedValue({
        content: [{
          text: JSON.stringify({
            question: "Test",
            answer: "Test",
            alternativeAnswers: [],
            explanation: "Test",
            category: "Test",
            difficulty: "easy"
          })
        }]
      });

      await claudeService.generateQuestion('Category1', 'easy');
      await claudeService.generateQuestion('Category2', 'hard');

      const stats = claudeService.getCacheStats();
      
      expect(stats.size).toBe(2);
      expect(stats.entries).toHaveLength(2);
      expect(stats.entries).toContain('Category1-easy-');
      expect(stats.entries).toContain('Category2-hard-');
    });
  });
});