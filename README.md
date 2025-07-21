# 🍷 SipSchool - AI-Powered Wine Learning Platform

A sophisticated wine education platform that combines expert-curated content with AI-generated questions, designed to help enthusiasts achieve professional-level knowledge equivalent to WSET Level 3 certification and Master Sommelier level.

## 🚀 Current Version: v2.2.0

**Latest Updates (v2.2.0)**: 
- ✅ Auto-login after registration
- ✅ Profile system with dropdown indicator
- ✅ User-specific API key management with encryption
- ✅ Single-attempt answer system with manual hints
- ✅ Advanced knowledge tracking with 75+ wine concepts
- ✅ API rate limits increased to 50 requests/15 min

**Previous Updates (v2.1.0)**:
- 🤖 Claude AI integration for dynamic question generation
- 🧪 Comprehensive testing suite (80+ tests)
- 📝 User feedback system with admin dashboard
- 🚀 Performance optimizations and rate limiting

## 🎯 Project Vision

SipSchool democratizes wine education by providing:
- **Intelligent Learning**: Text-based answers with synonym recognition and spaced repetition
- **Professional Knowledge**: Content equivalent to WSET Level 3 and Master Sommelier certifications
- **Personalized Experience**: Placement tests, progress tracking, and customized learning paths
- **Adaptive Feedback**: Progressive hint system that guides learning without giving away answers

## ✨ Current Features (v2.1.0)

### ✅ Core Learning System
- **50 Expert Wine Questions** across 9 comprehensive categories
- **Text-Based Answer Input** - Type your answers naturally
  - Intelligent answer matching with variations and synonyms
  - Accepts common abbreviations (e.g., "Cab Sauv" for "Cabernet Sauvignon")
  - Handles accented characters and regional spelling variations
  - Partial credit for complex multi-part answers
- **Progressive Hint System** - Up to 3 levels of contextual hints:
  - Level 1: Educational/contextual hints based on category
  - Level 2: Structural hints (word count, letter patterns)
  - Level 3: Revealing hints (first letters or words)
  - ✅ Manual hint button - request hints when needed
  - ✅ Single attempt only - immediate feedback after submission
- **Answer Variations Database** - Comprehensive synonym recognition for:
  - Grape varieties (30+ varieties with variations)
  - Wine regions (including local names)
  - Technical terms and processes

### ✅ User Experience
- **User Authentication System** 
  - JWT-based authentication
  - Guest mode with local storage
  - Persistent progress tracking
  - ✅ Auto-login after registration
  - ✅ Profile page with settings and API key management
  - ✅ Profile indicator dropdown in top-right corner
- **Placement Test** - 20-question assessment to determine starting level
  - Mix of basic, intermediate, and advanced questions
  - Automatically sets user level (Beginner/Intermediate/Advanced)
- **Category Filtering** - Focus on specific wine topics
  - Real-time accuracy statistics per category
  - Visual progress indicators
- **Session Tracking** - Monitor learning sessions with detailed stats
- **Mobile-Responsive Design** - Optimized for all devices

### ✅ Learning Science
- **Spaced Repetition Algorithm** (SM-2 inspired)
  - Intelligent review scheduling based on performance
  - Ease factor calculation (1.3 - 3.0)
  - Dynamic interval adjustments
  - Next review date tracking
- **Progress Analytics**
  - Category-specific accuracy tracking
  - Per-question attempt history
  - Session performance metrics
  - Visual progress indicators

### 🤖 AI-Powered Features (NEW!)
- **Dynamic Question Generation** - Uses Claude API to create personalized questions
- **Adaptive Learning** - Questions tailored to your weak areas
- **Intelligent Feedback** - AI-generated explanations for deeper understanding
- ✅ User-specific API keys with secure encryption
- ✅ Increased rate limit to 50 requests/15 min
- ✅ API key notification banner for users without keys

### 📝 User Feedback System (NEW!)
- **Rate Questions** - 5-star rating system for quality control
- **Report Issues** - Flag problems with questions or answers
- **Admin Dashboard** - Review and manage user feedback
- **Continuous Improvement** - Use feedback to enhance content

### ✨ New Features in v2.2.0

#### Authentication & Profile System ✅
- **Auto-login** - Seamless registration flow
- **Profile Indicator** - Dropdown menu with user avatar
- **Profile Page** - Manage settings and API keys
- **API Key Management** - Add your own Claude API key
- **API Key Notifications** - Reminder banner for setup

#### Answer System Redesign ✅
- **Single Attempt** - One chance per question
- **Manual Hints** - Click button to reveal hints
- **Hint Restrictions** - No hints after submission
- **Clear Status** - Visual feedback for attempts

#### Advanced Knowledge Tracking ✅
- **75+ Wine Concepts** - Comprehensive knowledge map
- **Mastery Tracking** - Exponential moving average algorithm
- **Learning Velocity** - Track improvement speed
- **Knowledge Gaps** - Automatic weakness identification
- **Smart Recommendations** - Personalized concept suggestions
- Concept mastery tracking
- Learning velocity metrics
- Knowledge gap analysis
- Temporal progression tracking

#### Priority 4: Infrastructure Updates
- Increase rate limits (50+ requests/15min)
- User-specific rate limiting
- Enhanced caching for knowledge data

### 🚧 Future Features (Phase 4)
- **Visual Learning Tools** - Interactive wine region maps
- **Voice Input** - Speak your answers
- **Achievement System** - Milestones tied to real certifications
- **Social Features** - Study groups and friend comparisons

## 🏗️ Tech Stack

- **Frontend**: 
  - React 18 with Hooks
  - Vite for blazing fast builds
  - Tailwind CSS for styling
  - Recharts for data visualization
  - React Router for navigation
- **Backend**: 
  - Node.js with Express
  - SQLite database
  - JWT authentication
  - bcrypt for password hashing
- **Development**: 
  - Concurrently for parallel processes
  - Nodemon for hot reloading
  - ESLint for code quality
- **Testing**:
  - Jest for backend unit tests
  - Vitest + React Testing Library for frontend
  - Supertest for API integration tests
- **Deployment**: 
  - Replit-ready configuration
  - Environment variable support

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/SipSchool.git
   cd SipSchool
   ```

2. **Install all dependencies**:
   ```bash
   npm run setup
   ```

3. **Configure environment**:
   ```bash
   # Create .env file in root directory
   cp .env.example .env
   ```

   Add to your `.env`:
   ```
   JWT_SECRET=your_super_secret_key_min_32_chars_here
   NODE_ENV=development
   PORT=3001
   CLAUDE_API_KEY=your_claude_api_key_here  # Optional but recommended
   ```

4. **Initialize the database**:
   ```bash
   npm run db:init
   ```

5. **Start development servers**:
   ```bash
   npm run dev
   ```

6. **Open in browser**: 
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

### Test Credentials
- **Username**: wine_lover
- **Password**: test123

## 📁 Project Structure

```
SipSchool/
├── 📄 README.md                    # This file
├── 📄 package.json                 # Server dependencies
├── 📄 .env                         # Environment variables
├── 📂 server/                      # Backend Express server
│   ├── 📄 index.js                 # Main server with API routes
│   ├── 📄 database.js              # SQLite database operations
│   ├── 📄 auth.js                  # JWT authentication middleware
│   └── 📄 initDb.js                # Database initialization
├── 📂 client/                      # Frontend React app
│   ├── 📄 package.json             # Client dependencies
│   ├── 📄 vite.config.js           # Vite configuration
│   ├── 📄 tailwind.config.js       # Tailwind CSS config
│   ├── 📂 src/
│   │   ├── 📄 App.jsx              # Main app with game logic
│   │   ├── 📂 components/
│   │   │   ├── 📄 QuestionCard.jsx # Question display component
│   │   │   ├── 📄 AuthScreen.jsx   # Login/register screen
│   │   │   ├── 📄 UserHeader.jsx   # User info header
│   │   │   └── 📄 HintHistory.jsx  # Hint tracking component
│   │   └── 📂 contexts/
│   │       └── 📄 UserContext.jsx  # Authentication context
│   └── 📂 public/                  # Static assets
├── 📂 data/                        # SQLite database file
│   └── 📄 sipschool.db            # User data and progress
├── 📂 documents/                   # Project documentation
└── 📂 scripts/                     # Utility scripts
```

## 🍷 Learning Content

### 9 Wine Knowledge Categories

1. **Grape Varieties** (8 questions) - Major varietals and their characteristics
2. **Wine Regions** (12 questions) - Old and New World wine regions
3. **Viticulture** (6 questions) - Vineyard management and terroir
4. **Winemaking** (6 questions) - Production techniques and processes
5. **Tasting & Analysis** (5 questions) - Sensory evaluation and faults
6. **Wine Service** (4 questions) - Proper serving techniques
7. **Food Pairing** (3 questions) - Classic combinations and principles
8. **Wine Laws** (3 questions) - Classifications and regulations
9. **Special Wines** (3 questions) - Sparkling, fortified, and dessert wines

## 🎮 How to Play

1. **Start Learning**: Create an account or continue as guest
2. **Take Placement Test**: 20 questions to assess your level (first-time users)
3. **Type Your Answer**: Natural language input with intelligent matching
4. **Get Hints**: Up to 3 progressive hints if you're stuck
5. **Learn from Mistakes**: Detailed explanations for every answer
6. **Track Progress**: See your accuracy by category
7. **Review Smartly**: Spaced repetition ensures optimal retention

## 🧠 Answer Recognition System

The app intelligently recognizes various forms of correct answers:

### Examples:
- **Grape Varieties**: 
  - "Cabernet Sauvignon" = "Cab Sauv", "Cabernet", "Cab"
  - "Pinot Noir" = "Pinot", "PN"
  - "Syrah" = "Shiraz" (regional variations)

- **Wine Regions**:
  - "Burgundy" = "Bourgogne" (French spelling)
  - "Rioja" = "La Rioja"
  - "Rhône" = "Rhone" (with or without accent)

- **Technical Terms**:
  - "Malolactic fermentation" = "Malo", "MLF"
  - Accepts partial answers for complex multi-part questions

## 🛠️ Development Commands

```bash
# Install all dependencies
npm run setup

# Start development (frontend + backend)
npm run dev

# Start backend only
npm run server

# Start frontend only
npm run client

# Build for production
npm run build

# Initialize database
npm run db:init

# Run backend server in production
npm start
```

## 📊 API Endpoints

### Public Endpoints
```
GET  /api/health                     # Server health check
GET  /api/questions                  # Get all questions
GET  /api/questions/:id              # Get specific question
GET  /api/categories                 # Get category list
```

### Authentication
```
POST /api/auth/register              # Create new account
POST /api/auth/login                 # User login
POST /api/auth/guest                 # Guest session
POST /api/auth/logout                # End session
GET  /api/auth/verify                # Verify current token
```

### Protected Endpoints (Requires Authentication)
```
GET  /api/progress                   # Get user progress
POST /api/progress/update            # Update progress
POST /api/sessions/start             # Start study session
POST /api/sessions/:id/end           # End study session
GET  /api/stats                      # Get learning statistics
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```bash
# Required
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
NODE_ENV=development

# Optional
PORT=3001
DATABASE_URL=./data/sipschool.db
SESSION_EXPIRE_HOURS=168
GUEST_SESSION_EXPIRE_HOURS=24

# AI Features (Optional but Recommended)
CLAUDE_API_KEY=your_claude_api_key_here  # Get from https://console.anthropic.com/
CLAUDE_API_BASE_URL=https://api.anthropic.com
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### 🤖 Setting Up Claude AI Integration

1. **Get your Claude API Key**:
   - Sign up at [Claude Console](https://console.anthropic.com/)
   - Create a new API key
   - Add it to your `.env` file

2. **Test the Integration**:
   ```bash
   node scripts/test-claude-api.js
   ```

3. **Features Enabled with Claude**:
   - Dynamic question generation based on user performance
   - Personalized questions targeting weak areas
   - AI-generated explanations and hints
   - Adaptive difficulty adjustment

4. **Rate Limits**:
   - 10 AI-generated questions per 15 minutes per user
   - Automatic fallback to static questions if limit exceeded
   - Caching enabled to reduce API calls

**Note**: The app works perfectly without Claude API - it will fall back to the 50+ expert-curated questions.

## 🧪 Testing

### Backend Tests
```bash
# Run all backend tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test auth.test.js

# Watch mode
npm run test:watch
```

### Frontend Tests
```bash
# Change to client directory
cd client

# Run all frontend tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Test Structure
```
├── tests/                     # Backend tests
│   ├── unit/                  # Unit tests
│   │   ├── auth.test.js
│   │   ├── answerMatcher.test.js
│   │   └── claudeService.test.js
│   └── integration/           # Integration tests
│       └── auth.integration.test.js
├── client/src/
│   ├── components/__tests__/  # Component tests
│   │   └── QuestionCard.test.jsx
│   └── services/__tests__/    # Service tests
│       └── api.test.js
```

## 🚀 Deployment

### Replit Deployment
1. Import from GitHub
2. Set environment variables in Secrets
3. Run `npm run setup`
4. Run `npm run build`
5. Start with `npm start`

### Production Considerations
- Use a strong JWT secret (32+ characters)
- Enable HTTPS
- Set appropriate CORS origins
- Regular database backups
- Monitor error logs

## 📈 Project Roadmap

### ✅ Phase 1: Core Learning (Complete)
- User authentication system
- 50 expert wine questions
- Basic flashcard interface
- Progress persistence

### ✅ Phase 2: Enhanced Learning (Complete)
- Text-based answer input
- Intelligent answer matching
- Progressive hint system
- Placement test
- Spaced repetition algorithm
- Category filtering with stats

### 🚧 Phase 3: AI Integration (In Progress)
- Claude API integration for dynamic questions
- Multi-agent question generation
- Advanced pattern matching
- Real-time question adaptation

### 🔮 Phase 4: Advanced Features (Planned)
- Interactive wine region maps
- Visual learning with images
- Voice input/output
- Achievement system
- Social features and study groups
- Mobile applications

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use ESLint configuration
- Follow React Hooks best practices
- Write descriptive commit messages
- Add comments for complex logic

## 🐛 Known Issues

- Placement test only runs once per browser (clear localStorage to reset)
- Some wine names with special characters may need exact spelling
- Guest progress is lost when clearing browser data
- **Answer System**: Currently allows 4 attempts (should be 1)
- **Hints**: Show automatically after wrong answers (should be button-triggered)
- **Authentication**: No auto-login after registration
- **Profile**: No profile page or user API key management
- **Rate Limits**: Too low for production AI features (10/15min)

## 📚 Resources

### Wine Education
- [Wine & Spirit Education Trust (WSET)](https://www.wsetglobal.com/)
- [Court of Master Sommeliers](https://www.mastersommeliers.org/)
- [Guild of Sommeliers](https://www.guildsomm.com/)

### Technical Documentation
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express.js](https://expressjs.com/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Wine content standards from WSET and Court of Master Sommeliers
- Spaced repetition algorithm inspired by SuperMemo SM-2
- Built with guidance from Claude (Anthropic)
- Open source community for the amazing tools

---

**Ready to master wine knowledge?** 🍷 Start your journey with SipSchool today!

*Created by Sam Chronert with AI assistance from Claude*