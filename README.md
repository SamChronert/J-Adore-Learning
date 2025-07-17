# 🍷 SipSchool - Intelligent Wine Learning Platform

A sophisticated flashcard-based wine education platform designed to help enthusiasts achieve expert-level knowledge equivalent to WSET Level 3 certification and Master Sommelier level, without the cost of formal courses.

## 🎯 Project Vision

SipSchool aims to democratize wine education by providing:
- **Intelligent Learning**: AI-powered adaptive questions and spaced repetition
- **Professional Knowledge**: Content equivalent to WSET Level 3 and Master Sommelier certifications
- **Personalized Experience**: Placement tests, progress tracking, and customized learning paths
- **Social Learning**: Share progress with friends and learn together

## ✨ Current Features (v1.1.0)

### ✅ Implemented
- **50 Expert Wine Questions** across 9 comprehensive categories
- **User Authentication System** with JWT tokens and guest mode
- **Interactive Flashcard Interface** with show/hide answers
- **Progress Persistence** with database storage for registered users
- **Category Filtering** to focus on specific wine topics
- **Difficulty Levels** (basic, intermediate, advanced)
- **Performance Tracking** with category-specific analytics
- **Mobile-Responsive Design** optimized for all devices
- **Professional Architecture** with separate frontend/backend

### 🚧 In Development (Phase 2)
- **Natural Language Answer Input** - Type answers instead of clicking buttons
- **Placement Test** - 20-question assessment to determine starting level
- **Spaced Repetition Algorithm** - Science-based review scheduling
- **Progressive Hint System** - Contextual hints based on attempts
- **Answer Variations** - Accept synonyms and alternate spellings

### 🔮 Future Features (Phase 3-4)
- **AI-Powered Questions** - Dynamic generation using Claude API
- **Interactive Wine Maps** - Visual learning by region
- **Achievement System** - Milestones tied to certifications
- **Voice Input** - Speak your answers
- **Multi-Modal Learning** - Images, maps, and audio
- **Friend Sharing** - Study groups and progress comparison

## 🏗️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express, SQLite
- **Authentication**: JWT tokens with bcrypt
- **AI Integration**: Claude API (planned)
- **Development**: Nodemon, Concurrently
- **Deployment**: Replit, GitHub

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

2. **Install dependencies**:
   ```bash
   npm run setup
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the database**:
   ```bash
   npm run db:init
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Open in browser**: http://localhost:3001

### Test Credentials (Development)
- **Username**: wine_lover
- **Password**: test123

## 📁 Project Structure

```
SipSchool/
├── 📄 README.md                    # Project overview (this file)
├── 📄 ROADMAP.md                   # Development roadmap
├── 📄 CHANGELOG.md                 # Version history
├── 📄 package.json                 # Server dependencies
├── 📄 .env                         # Environment configuration
├── 📂 server/                      # Backend code
│   ├── 📄 index.js                 # Express server (50 questions)
│   ├── 📄 database.js              # SQLite database service
│   ├── 📄 auth.js                  # JWT authentication
│   └── 📄 initDb.js                # Database initialization
├── 📂 client/                      # Frontend React app
│   ├── 📄 package.json             # Client dependencies
│   ├── 📂 src/                     # React source code
│   │   ├── 📄 App.jsx              # Main application
│   │   ├── 📂 components/          # React components
│   │   └── 📂 contexts/            # React contexts
│   └── 📂 public/                  # Static assets
├── 📂 data/                        # SQLite database files
├── 📂 documents/                   # Project documentation
│   ├── 📄 requirements/            # Original requirements
│   ├── 📄 design/                  # Design specifications
│   └── 📄 development/             # Development logs
└── 📂 scripts/                     # Utility scripts
```

## 🍷 Learning Content

### 9 Wine Knowledge Categories

1. **Grape Varieties** (8 questions)
   - Major international varieties
   - Regional specialties
   - Grape characteristics

2. **Wine Regions** (12 questions)
   - Old World classics
   - New World innovations
   - Terroir and appellations

3. **Viticulture** (6 questions)
   - Vineyard management
   - Climate and soil
   - Sustainable practices

4. **Winemaking** (6 questions)
   - Production techniques
   - Fermentation processes
   - Aging methods

5. **Tasting & Analysis** (5 questions)
   - Sensory evaluation
   - Wine faults
   - Professional tasting

6. **Wine Service** (4 questions)
   - Proper temperatures
   - Decanting techniques
   - Storage conditions

7. **Food Pairing** (3 questions)
   - Classic combinations
   - Pairing principles
   - Regional matches

8. **Wine Laws** (3 questions)
   - Classification systems
   - Appellation rules
   - Label regulations

9. **Special Wines** (3 questions)
   - Sparkling wines
   - Fortified wines
   - Dessert wines

## 🎓 Learning Methodology

### Adaptive Learning System
- **No Visible Levels**: Seamless progression based on performance
- **Category Mastery**: Independent tracking across all 9 categories
- **Smart Review**: Questions appear when you're about to forget them
- **Personalized Path**: Algorithm adapts to your strengths and weaknesses

### Target Certifications
- **WSET Level 1-3**: Wine & Spirit Education Trust standards
- **Court of Master Sommeliers**: Introductory to Advanced levels
- **Industry Professional**: Practical knowledge for wine careers

## 🛠️ Development Commands

```bash
# Install dependencies
npm run setup

# Development mode (frontend + backend)
npm run dev

# Production build
npm run build

# Database management
npm run db:init          # Initialize database
npm run db:reset         # Reset database
npm run db:backup        # Backup database

# Run tests
npm test
```

## 📊 API Documentation

### Public Endpoints
```
GET  /api/health                     # Server health check
GET  /api/questions                  # All questions
GET  /api/questions/category/:name   # Filter by category
GET  /api/questions/difficulty/:level # Filter by difficulty
GET  /api/questions/random/:count    # Random questions
GET  /api/categories                 # Category statistics
```

### Authentication Endpoints
```
POST /api/auth/register              # Create account
POST /api/auth/login                 # User login
POST /api/auth/guest                 # Guest session
POST /api/auth/logout                # End session
GET  /api/auth/verify                # Verify token
```

### Protected Endpoints
```
GET  /api/progress                   # User progress
POST /api/progress/update            # Update progress
POST /api/sessions/start             # Start study session
POST /api/sessions/:id/end           # End study session
GET  /api/stats                      # Learning statistics
```

## 🔧 Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=./data/sipschool.db

# Authentication
JWT_SECRET=your_super_secret_key_min_32_chars
SESSION_EXPIRE_HOURS=168
GUEST_SESSION_EXPIRE_HOURS=24

# Features
ENABLE_USER_REGISTRATION=true
ENABLE_GUEST_MODE=true
ENABLE_SPACED_REPETITION=true

# API Keys (Future)
CLAUDE_API_KEY=your_claude_api_key
```

## 🚀 Deployment

### Replit Deployment
1. Import from GitHub
2. Set environment variables
3. Run `npm run setup`
4. Deploy with Replit's button

### Production Checklist
- [ ] Set strong JWT secret
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Monitor error logs
- [ ] Configure rate limiting

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- Use ESLint configuration
- Follow React best practices
- Write clear commit messages
- Document new features

## 📈 Project Status

### Current Phase: Enhanced Learning Mechanics
- ✅ Authentication system complete
- ✅ Database architecture ready
- 🚧 Text answer input in progress
- 🚧 Spaced repetition algorithm
- 🚧 Placement test implementation

### Next Phases
1. **AI Integration**: Claude API for dynamic questions
2. **Visual Learning**: Interactive maps and images
3. **Social Features**: Friend sharing and study groups
4. **Mobile Apps**: iOS and Android versions

## 📚 Documentation

- [Development Roadmap](ROADMAP.md)
- [API Documentation](docs/API.md)
- [Design Specifications](documents/design/)
- [Development Logs](documents/development/)
- [Original Requirements](documents/requirements/)

## 🙏 Acknowledgments

- **Wine Standards**: WSET and Court of Master Sommeliers
- **Design Inspiration**: Modern education platforms
- **Technical Stack**: React, Node.js, and open-source community
- **AI Partnership**: Claude (Anthropic) for development guidance

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

**Ready to become a wine expert?** 🍷

Start your journey today with SipSchool - where wine education meets intelligent technology.