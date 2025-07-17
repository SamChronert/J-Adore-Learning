# Dynamic Question Generation - Technical Implementation Guide

## Overview

This guide details the technical implementation of the dynamic question generation system for the Wine Learning App, focusing on the AI agent coordination and practical code structure.

## System Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Question Generation Engine                 │
├─────────────────┬────────────────┬──────────────────────────┤
│ Template System │ Pattern Library │ Real-time AI Generation │
├─────────────────┴────────────────┴──────────────────────────┤
│                    Question Quality Pipeline                  │
├──────────────────────────────────────────────────────────────┤
│                    User Context Analyzer                      │
└──────────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Template-Based System (MVP)

#### 1.1 Question Template Structure

```javascript
const questionTemplate = {
  id: "template_001",
  category: "Wine Regions",
  subcategory: "France - Bordeaux",
  difficulty: "intermediate",
  pattern: "What is the primary grape variety used in {subregion} for {wine_color} wines?",
  variables: {
    subregion: ["Pauillac", "Margaux", "Saint-Émilion", "Pomerol"],
    wine_color: ["red", "white"]
  },
  validAnswers: {
    "Pauillac_red": ["Cabernet Sauvignon"],
    "Margaux_red": ["Cabernet Sauvignon"],
    "Saint-Émilion_red": ["Merlot", "Merlot-based"],
    "Pomerol_red": ["Merlot"],
    "subregion_white": ["Sauvignon Blanc", "Sémillon"]
  },
  hints: [
    "Think about Left Bank vs Right Bank",
    "Left Bank favors one grape, Right Bank another",
    "Pauillac and Margaux are Left Bank appellations"
  ]
};
```

#### 1.2 Pattern Library Examples

```javascript
const patternLibrary = {
  comparison: {
    basic: "Compare {item1} and {item2}",
    detailed: "How does {characteristic} differ between {region1} and {region2}?",
    complex: "Analyze the {aspect} of {item1} versus {item2} in the context of {condition}"
  },
  
  scenario: {
    service: "A guest asks for {request}. What do you recommend?",
    pairing: "What wine would you pair with {dish} and why?",
    problem: "You notice {issue} in a {wine}. What's the likely cause?"
  },
  
  identification: {
    basic: "Identify the {category} of {item}",
    blind: "Given these characteristics: {traits}, what wine is this likely to be?",
    process: "What {process} produces {result} in {context}?"
  }
};
```

### Phase 2: AI-Powered Generation

#### 2.1 Claude API Integration Structure

```javascript
class AIQuestionGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.contextWindow = [];
  }

  async generateQuestion(userContext) {
    const prompt = this.buildPrompt(userContext);
    
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 500,
        temperature: 0.7
      })
    });
    
    const question = await response.json();
    return this.validateAndFormat(question);
  }

  buildPrompt(context) {
    return `
      As a Wine Expert and Education Specialist, generate a wine education question.
      
      User Context:
      - Current Level: ${context.level}
      - Weak Areas: ${context.weakAreas.join(', ')}
      - Recent Topics: ${context.recentTopics.join(', ')}
      - Preferred Regions: ${context.preferences.regions.join(', ')}
      
      Requirements:
      - Difficulty: ${context.targetDifficulty}
      - Category: ${context.category}
      - Question Type: ${context.questionType}
      
      Generate a question that:
      1. Tests specific knowledge gaps
      2. Builds on previously mastered concepts
      3. Is clear and unambiguous
      4. Has a definitive correct answer
      
      Format:
      {
        "question": "The question text",
        "correctAnswer": "The correct answer",
        "acceptableVariations": ["Other valid answers"],
        "explanation": "Why this is correct",
        "followUpTopics": ["Related concepts to explore"],
        "hints": ["Progressive hints if needed"]
      }
    `;
  }
}
```

#### 2.2 Answer Analysis Engine

```javascript
class AnswerAnalyzer {
  constructor(wineExpertAgent) {
    this.wineExpert = wineExpertAgent;
    this.synonymDatabase = new WineSynonymDB();
  }

  async analyzeAnswer(userAnswer, correctAnswer, question) {
    const analysis = {
      isCorrect: false,
      accuracy: 0,
      missingElements: [],
      incorrectElements: [],
      partialCredit: [],
      followUpNeeded: []
    };
    
    // Normalize and tokenize answers
    const normalizedUser = this.normalize(userAnswer);
    const normalizedCorrect = this.normalize(correctAnswer);
    
    // Check for exact match
    if (normalizedUser === normalizedCorrect) {
      analysis.isCorrect = true;
      analysis.accuracy = 100;
      return analysis;
    }
    
    // Check for synonyms and variations
    const userTokens = this.tokenize(normalizedUser);
    const correctTokens = this.tokenize(normalizedCorrect);
    
    // Analyze each component
    for (const token of correctTokens) {
      if (userTokens.includes(token) || 
          this.hasSynonym(token, userTokens)) {
        analysis.partialCredit.push(token);
      } else {
        analysis.missingElements.push(token);
        analysis.followUpNeeded.push(
          this.generateFollowUpTopic(token, question)
        );
      }
    }
    
    // Calculate accuracy score
    analysis.accuracy = Math.round(
      (analysis.partialCredit.length / correctTokens.length) * 100
    );
    
    analysis.isCorrect = analysis.accuracy >= 80;
    
    return analysis;
  }
  
  generateFollowUpTopic(missingElement, originalQuestion) {
    // Logic to determine what follow-up question would address this gap
    return {
      topic: missingElement,
      category: this.categorizeGap(missingElement),
      suggestedDifficulty: this.assessGapDifficulty(missingElement)
    };
  }
}
```

### Phase 3: Intelligent Follow-Up System

#### 3.1 Follow-Up Chain Generator

```javascript
class FollowUpGenerator {
  constructor(questionGenerator, userProgressTracker) {
    this.questionGen = questionGenerator;
    this.progressTracker = userProgressTracker;
  }

  async generateFollowUpChain(originalQuestion, userAnswer, analysis) {
    const chain = [];
    
    // Prioritize gaps by importance
    const prioritizedGaps = this.prioritizeGaps(analysis.missingElements);
    
    for (const gap of prioritizedGaps.slice(0, 3)) { // Max 3 follow-ups
      const followUp = await this.createTargetedQuestion(gap, originalQuestion);
      chain.push(followUp);
    }
    
    return chain;
  }

  async createTargetedQuestion(gap, context) {
    // Generate a question specifically targeting the knowledge gap
    const questionParams = {
      focusArea: gap.topic,
      difficulty: gap.suggestedDifficulty,
      relatedTo: context,
      questionType: this.selectOptimalType(gap)
    };
    
    return await this.questionGen.generateQuestion(questionParams);
  }
  
  selectOptimalType(gap) {
    // Determine best question type based on the gap
    const gapTypes = {
      factual: 'direct_recall',
      conceptual: 'explanation',
      procedural: 'application',
      analytical: 'comparison'
    };
    
    return gapTypes[gap.category] || 'direct_recall';
  }
}
```

### Phase 4: Progressive Hint System

#### 4.1 Hint Generation Engine

```javascript
class HintEngine {
  constructor(userKnowledgeBase) {
    this.userKnowledge = userKnowledgeBase;
  }

  generateHintSequence(question, answer, userProfile) {
    const hints = [];
    const knowledge = this.userKnowledge.getKnownConcepts(userProfile.id);
    
    // Level 1: Category hint
    hints.push(this.generateCategoryHint(question, knowledge));
    
    // Level 2: Contextual hint using known knowledge
    hints.push(this.generateContextualHint(question, answer, knowledge));
    
    // Level 3: Structural hint
    hints.push(this.generateStructuralHint(answer));
    
    // Level 4: First letter/partial reveal
    hints.push(this.generatePartialReveal(answer));
    
    return hints;
  }

  generateContextualHint(question, answer, userKnowledge) {
    // Create hints that reference what the user already knows
    const relatedConcepts = this.findRelatedKnownConcepts(answer, userKnowledge);
    
    if (relatedConcepts.length > 0) {
      return `Think about how this relates to ${relatedConcepts[0]}, which you've already mastered`;
    }
    
    return this.generateGenericContextHint(question);
  }
}
```

## Database Schema for Dynamic Generation

```sql
-- Enhanced schema for dynamic question system
CREATE TABLE question_patterns (
  id SERIAL PRIMARY KEY,
  pattern_type VARCHAR(50),
  pattern_template TEXT,
  category VARCHAR(50),
  difficulty_range VARCHAR(20),
  effectiveness_score DECIMAL(3,2),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE generated_questions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  pattern_id INTEGER REFERENCES question_patterns(id),
  question_text TEXT,
  correct_answer TEXT,
  answer_variations JSON,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  generation_method VARCHAR(20) -- 'template', 'pattern', 'ai'
);

CREATE TABLE user_answers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  question_id INTEGER REFERENCES generated_questions(id),
  user_answer TEXT,
  is_correct BOOLEAN,
  accuracy_score INTEGER,
  answer_analysis JSON,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  time_to_answer INTEGER -- in seconds
);

CREATE TABLE follow_up_chains (
  id SERIAL PRIMARY KEY,
  parent_question_id INTEGER REFERENCES generated_questions(id),
  child_question_id INTEGER REFERENCES generated_questions(id),
  gap_addressed VARCHAR(255),
  sequence_order INTEGER
);

CREATE TABLE hint_usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  question_id INTEGER REFERENCES generated_questions(id),
  hint_level INTEGER,
  hint_text TEXT,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Performance Optimization

### Caching Strategy

```javascript
class QuestionCache {
  constructor(cacheSize = 50) {
    this.cache = new Map();
    this.cacheSize = cacheSize;
    this.userQueues = new Map();
  }

  async preGenerateQuestions(userId) {
    const userContext = await this.getUserContext(userId);
    const questions = [];
    
    // Generate mix of question types
    const distribution = {
      template: 5,
      pattern: 3,
      ai: 2
    };
    
    for (const [type, count] of Object.entries(distribution)) {
      for (let i = 0; i < count; i++) {
        const question = await this.generateByType(type, userContext);
        questions.push(question);
      }
    }
    
    this.userQueues.set(userId, questions);
  }

  getNextQuestion(userId) {
    const queue = this.userQueues.get(userId) || [];
    const question = queue.shift();
    
    // Trigger regeneration if queue is low
    if (queue.length < 5) {
      this.preGenerateQuestions(userId); // Async, non-blocking
    }
    
    return question;
  }
}
```

## Monitoring and Analytics

### Question Effectiveness Tracking

```javascript
class QuestionAnalytics {
  trackQuestionPerformance(questionId, performance) {
    const metrics = {
      questionId,
      answerAccuracy: performance.accuracy,
      timeToAnswer: performance.timeSpent,
      hintsUsed: performance.hintsUsed,
      followUpsGenerated: performance.followUps.length,
      userDifficulty: performance.perceivedDifficulty // 1-5 scale
    };
    
    this.updateQuestionStats(metrics);
    this.adjustQuestionDifficulty(questionId, metrics);
  }

  adjustQuestionDifficulty(questionId, metrics) {
    // Automatically adjust question difficulty based on aggregate performance
    if (metrics.answerAccuracy < 30 && metrics.hintsUsed > 2) {
      this.markQuestionForReview(questionId, 'too_difficult');
    } else if (metrics.answerAccuracy > 95 && metrics.timeToAnswer < 10) {
      this.markQuestionForReview(questionId, 'too_easy');
    }
  }
}
```

## Integration Points

### API Endpoints

```javascript
// Question generation endpoint
app.post('/api/questions/generate', async (req, res) => {
  const { userId } = req.body;
  const question = await questionService.getNextQuestion(userId);
  res.json(question);
});

// Answer submission endpoint
app.post('/api/questions/answer', async (req, res) => {
  const { userId, questionId, answer } = req.body;
  const analysis = await answerService.analyzeAnswer(answer, questionId);
  const followUps = await followUpService.generateIfNeeded(analysis);
  
  res.json({
    analysis,
    followUps,
    nextQuestion: await questionService.getNextQuestion(userId)
  });
});

// Hint request endpoint
app.post('/api/questions/hint', async (req, res) => {
  const { userId, questionId, hintLevel } = req.body;
  const hint = await hintService.getHint(questionId, hintLevel, userId);
  
  res.json({ hint, nextLevel: hintLevel + 1 });
});
```

This implementation guide provides the technical foundation for building the dynamic question generation system. The phased approach allows you to start with templates and progressively add AI-powered features as the system matures.