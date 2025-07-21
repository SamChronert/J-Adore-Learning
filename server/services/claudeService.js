const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

class ClaudeService {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.CLAUDE_API_KEY;
    this.client = new Anthropic({
      apiKey: this.apiKey,
    });
    this.cache = new Map();
    this.cacheTimeout = 3600000; // 1 hour
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.client = new Anthropic({
      apiKey: this.apiKey,
    });
  }

  async generateQuestion(category, difficulty, userWeaknesses = []) {
    const cacheKey = `${category}-${difficulty}-${userWeaknesses.join(',')}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const prompt = this.createQuestionPrompt(category, difficulty, userWeaknesses);
      
      const response = await this.client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1000,
        temperature: 0.8,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const questionData = this.parseResponse(response.content[0].text);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: questionData,
        timestamp: Date.now()
      });

      return questionData;
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error('Failed to generate question');
    }
  }

  createQuestionPrompt(category, difficulty, userWeaknesses) {
    const weaknessContext = userWeaknesses.length > 0 
      ? `The user has shown weakness in these areas: ${userWeaknesses.join(', ')}. ` 
      : '';

    return `Generate a wine education question for the category "${category}" at "${difficulty}" difficulty level.
    ${weaknessContext}
    
    Please provide:
    1. A clear, educational question about wine
    2. The correct answer (concise but complete)
    3. Three alternative answer variations that would also be considered correct
    4. A brief explanation (2-3 sentences) of why this is important to know
    
    Format your response as JSON:
    {
      "question": "your question here",
      "answer": "main correct answer",
      "alternativeAnswers": ["variation 1", "variation 2", "variation 3"],
      "explanation": "brief explanation",
      "category": "${category}",
      "difficulty": "${difficulty}"
    }
    
    Categories include: Grape Varieties, Wine Regions, Winemaking, Wine Service, Food Pairing, Wine Faults, Terroir, Wine Regulations.
    Difficulties: easy, medium, hard.
    
    Make sure the question is practical and relevant for wine professionals and enthusiasts.`;
  }

  parseResponse(responseText) {
    try {
      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      const required = ['question', 'answer', 'alternativeAnswers', 'explanation', 'category', 'difficulty'];
      for (const field of required) {
        if (!parsed[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to parse Claude response:', error);
      throw new Error('Invalid response format from Claude');
    }
  }

  async generateBatchQuestions(specifications) {
    const questions = [];
    
    for (const spec of specifications) {
      try {
        const question = await this.generateQuestion(
          spec.category,
          spec.difficulty,
          spec.userWeaknesses || []
        );
        questions.push(question);
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate question for ${spec.category}:`, error);
      }
    }
    
    return questions;
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

module.exports = ClaudeService;