 # Wine Learning App - Enhanced Requirements with Dynamic Generation

## Project Overview

A flashcard-based wine education web application designed to help enthusiasts achieve expert-level knowledge equivalent to WSET Level 3 certification and Master Sommelier level, without the cost of formal courses. Built using Claude AI and Replit, featuring **intelligent real-time question generation** and progress tracking.

## Core Enhancement: Dynamic Question Generation System

### Real-Time Question Generation Pipeline

The app will use AI agents to generate questions dynamically based on user performance:

```
User Performance Data → AI Analysis → Question Generation → Delivery → Answer Evaluation → Follow-up Generation
```

### AI Agent Roles in Question Generation

1. **Education Specialist Agent**
   - Analyzes user's current knowledge state
   - Identifies optimal next learning objective
   - Determines appropriate difficulty level
   - Selects question type based on learning science

2. **Wine Expert Agent**
   - Generates factually accurate questions in real-time
   - Creates contextually relevant follow-ups
   - Validates answer accuracy
   - Ensures industry relevance

3. **Product Manager Agent**
   - Ensures question clarity and user experience
   - Manages question variety and engagement
   - Coordinates between agents

## Enhanced Features

### 1. Question Bank Architecture

#### Initial Seed Bank (MVP)
- **200-500 Template Questions** covering all 9 categories
- Templates can be dynamically modified based on:
  - User's demonstrated vocabulary level
  - Recent learning context
  - Regional focus preferences
  - Current mastery level

#### Pattern Library System
Pre-built question patterns that accept dynamic content:

**Comparison Patterns:**
- "Compare [Region A] and [Region B] in terms of [Characteristic]"
- "How does [Grape Variety] express differently in [Region A] versus [Region B]?"
- "Contrast the [Winemaking Technique] used in [Region A] with [Region B]"

**Scenario Patterns:**
- "A customer describes wanting [Flavor Profile]. Recommend wines from [Region]"
- "You're designing a [Event Type] for [Guest Count] people. Create a wine list featuring [Region/Style]"
- "A [Wine Style] shows [Fault/Characteristic]. What caused this and how would you address it?"

**Analysis Patterns:**
- "Explain why [Region] is particularly suited for [Grape Variety]"
- "What factors contribute to [Region]'s ability to produce [Wine Style]?"
- "How has [Historical Event] shaped modern winemaking in [Region]?"

### 2. Progressive Hint System

**Contextual Hints Based on User Knowledge:**

Example Question: "What are the five first growths of Bordeaux?"

**Hint Progression:**
1. *First Hint*: "Three are from Pauillac, one from Margaux, and one from Graves"
2. *Second Hint*: "They were classified in 1855, except for one addition in 1973"
3. *Third Hint*: "Lafite and Latour are from the same commune"
4. *Final Hint*: Show first letters: "L___, L___, M___, H___-B___, M___"

The hints adapt based on what the user has previously demonstrated:
- If they've shown knowledge of Bordeaux geography, skip to hint 2
- If they know the 1855 classification, start with hint 3

### 3. Multi-Modal Question Types (Post-MVP)

**Phase 2 Enhancement:**
- **Label Analysis**: Upload wine label images for identification exercises
- **Map Identification**: Interactive map questions for region recognition
- **Blind Tasting Simulation**: Describe wine characteristics, user identifies possible varieties/regions
- **Food Pairing Visuals**: Show dish images, select appropriate wine pairings

### 4. Intelligent Follow-Up Generation

**Gap-Based Follow-Ups:**

When users provide partial answers, the system generates targeted follow-ups:

**Example Interaction:**
```
Q: "Describe the key characteristics of Barolo"
A: "Made from Nebbiolo, tannic, from Italy"

System identifies gaps:
- Missing specific region (Piedmont)
- No mention of aging requirements
- Lacks commune knowledge
- Missing flavor descriptors

Follow-up sequence:
1. "In which specific region of Italy is Barolo produced?"
2. "What are the minimum aging requirements for Barolo?"
3. "Name the two main soil types in Barolo and their impact"
4. "What aromatic characteristics develop in aged Barolo?"
```

### 5. Dynamic Difficulty Progression

**Per-Category Difficulty with Question Examples:**

**Basic (Recognition & Recall):**
- Template: "What is the primary grape in [Region]?"
- Example: "What is the primary grape in Chablis?"

**Intermediate (Application & Analysis):**
- Template: "Explain how [Terroir Element] affects [Grape] in [Region]"
- Example: "Explain how limestone soils affect Chardonnay in Chablis"

**Advanced (Synthesis & Evaluation):**
- Template: "Design a [Experience Type] featuring [Constraint]"
- Example: "Design a vertical tasting of Château d'Yquem for a collector"

**Master (Real-World Scenarios):**
- Template: "Handle this service situation: [Complex Scenario]"
- Example: "A guest claims their Grand Cru Burgundy is corked, but you detect only subtle reduction. How do you proceed?"

## Implementation Details

### Question Generation Service Architecture

```javascript
class QuestionGenerationService {
  constructor(educationAgent, wineExpertAgent, pmAgent) {
    this.educationAgent = educationAgent;
    this.wineExpertAgent = wineExpertAgent;
    this.pmAgent = pmAgent;
    this.patternLibrary = new PatternLibrary();
    this.seedBank = new QuestionSeedBank();
  }

  async generateQuestion(userId) {
    // Step 1: Analyze learning state
    const learningContext = await this.educationAgent.analyzeLearningState(userId);
    
    // Step 2: Select generation method
    if (learningContext.needsNovelQuestion) {
      return await this.generateNovelQuestion(learningContext);
    } else {
      return await this.generateFromTemplate(learningContext);
    }
  }

  async generateFromTemplate(context) {
    // Select appropriate template
    const template = this.seedBank.selectTemplate(context);
    
    // Fill template with contextual content
    const question = await this.wineExpertAgent.fillTemplate(template, context);
    
    // Validate clarity
    return await this.pmAgent.validateClarity(question);
  }

  async generateNovelQuestion(context) {
    // Generate completely new question
    const questionParams = {
      category: context.weakestCategory,
      difficulty: context.currentLevel,
      recentMisses: context.gaps,
      userInterests: context.preferences
    };
    
    return await this.wineExpertAgent.createQuestion(questionParams);
  }
}
```

### Quality Assurance Pipeline

Every generated question passes through:

1. **Accuracy Validation** (Wine Expert Agent)
   - Factual correctness
   - Current information
   - Regional authenticity

2. **Pedagogical Validation** (Education Specialist Agent)
   - Appropriate difficulty
   - Clear learning objective
   - Proper progression

3. **User Experience Validation** (PM Agent)
   - Clarity and readability
   - Engaging phrasing
   - Mobile-friendly length

### Database Schema Updates

```sql
-- Question Templates Table
CREATE TABLE question_templates (
  id SERIAL PRIMARY KEY,
  pattern TEXT NOT NULL,
  category VARCHAR(50),
  difficulty_level VARCHAR(20),
  variables JSON,
  usage_count INTEGER DEFAULT 0,
  effectiveness_score DECIMAL(3,2)
);

-- Generated Questions Log
CREATE TABLE generated_questions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  template_id INTEGER REFERENCES question_templates(id),
  generated_question TEXT,
  generated_at TIMESTAMP,
  user_response TEXT,
  was_correct BOOLEAN,
  response_time INTEGER,
  follow_up_generated BOOLEAN
);

-- Hint Progressions Table
CREATE TABLE hint_progressions (
  id SERIAL PRIMARY KEY,
  question_template_id INTEGER REFERENCES question_templates(id),
  hint_level INTEGER,
  hint_text TEXT,
  prerequisite_knowledge JSON
);
```

## MVP Implementation Updates

### Phase 1 (Weeks 1-2) - Enhanced MVP
- Basic user authentication
- **Seed bank of 200 template questions**
- **Pattern library with 20 question patterns**
- Simple template-based generation
- Basic spaced repetition
- 9 category progress tracking
- Mobile-responsive design

### Phase 2 (Weeks 3-4) - AI Integration
- Claude API integration for novel question generation
- **Progressive hint system implementation**
- Dynamic difficulty adjustment
- **Intelligent follow-up generation**
- Expanded to 500+ question templates

### Phase 3 (Weeks 5-6) - Advanced Features
- **Multi-modal question types** (image-based)
- Advanced pattern matching for answers
- Contextual question chaining
- Performance analytics for question effectiveness
- A/B testing for question patterns

## Success Metrics (Enhanced)

### Question Generation Metrics
- Question variety score (low repetition)
- Answer accuracy correlation with question clarity
- Time-to-answer by question type
- Hint usage patterns
- Follow-up question effectiveness

### Learning Effectiveness Metrics
- Concept mastery speed
- Long-term retention rates
- User engagement with dynamic questions
- Progression through difficulty levels

## Technical Considerations

### Caching Strategy
- Cache generated questions for 24 hours
- Pre-generate next 10 likely questions during idle time
- Store successful question-answer pairs for pattern learning

### API Optimization
- Batch question generation during low-usage periods
- Use template-based questions for 70% of interactions
- Reserve API calls for novel scenarios and complex follow-ups

### Offline Functionality
- Download next 50 questions based on learning trajectory
- Store hint progressions locally
- Sync question performance data when reconnected

## Content Governance

### Question Review Process
1. All template patterns reviewed by Wine Expert agent
2. Novel generated questions logged for periodic review
3. User-reported issues trigger immediate review
4. Monthly analysis of question effectiveness

### Continuous Improvement
- Track which patterns drive best learning outcomes
- Identify questions causing confusion
- Update templates based on wine industry changes
- Incorporate user feedback into pattern library

This enhanced system will create a truly adaptive learning experience that feels personalized and intelligent while maintaining efficiency and scalability.