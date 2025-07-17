# 🍷 SipSchool - Wine Learning App

A sophisticated flashcard-based wine education platform designed to help enthusiasts achieve expert-level knowledge equivalent to WSET Level 3 certification and Master Sommelier level, without the cost of formal courses.

## ✨ Features

### Current (v1.1.0)
- ✅ **50 Expert Wine Questions** across 9 categories
- ✅ **Interactive Flashcard Interface** with show/hide answers
- ✅ **Progress Persistence** with localStorage
- ✅ **Category Filtering** - study specific wine topics
- ✅ **Difficulty Levels** - basic, intermediate, advanced
- ✅ **Performance Tracking** - accuracy by category
- ✅ **Mobile-Responsive Design** - works on all devices
- ✅ **Wine-Themed UI** - elegant purple-to-red gradient

### Coming Soon (Next Phase)
- 🚧 **User Authentication** - secure accounts with JWT
- 🚧 **SQLite Database** - persistent progress tracking
- 🚧 **Spaced Repetition** - intelligent review scheduling
- 🚧 **Placement Test** - determine starting knowledge level
- 🚧 **Study Analytics** - detailed progress insights

### Future Features
- 🔮 **AI-Powered Questions** - dynamic generation with Claude API
- 🔮 **Interactive Wine Maps** - study by region
- 🔮 **Achievement System** - WSET/Master Som milestones
- 🔮 **Multi-Modal Learning** - images, maps, audio

## 🏗️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express, SQLite
- **Authentication**: JWT, bcrypt
- **Development**: Nodemon, Concurrently
- **Deployment**: Replit, GitHub

## 🚀 Quick Start

### Option 1: Replit (Recommended)
1. Fork this repository on GitHub
2. Import to Replit from GitHub
3. Run setup and start:
   ```bash
   npm run setup
   npm run dev
   ```
4. Open the preview window to use the app

### Option 2: Local Development
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

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**: http://localhost:3001

## 📁 Project Structure

```
SipSchool/
├── 📄 README.md                    # This file
├── 📄 package.json                 # Server dependencies
├── 📄 .env                         # Environment variables
├── 📄 .gitignore                   # Git exclusions
├── 📄 .replit                      # Replit configuration
├── 📂 server/                      # Backend code
│   ├── 📄 index.js                 # Main server file (50 questions)
│   ├── 📄 database.js              # SQLite database setup
│   └── 📄 auth.js                  # Authentication system
├── 📂 client/                      # Frontend code
│   ├── 📄 package.json             # Client dependencies
│   ├── 📄 index.html               # HTML template
│   ├── 📄 vite.config.js           # Vite configuration
│   ├── 📄 tailwind.config.js       # Tailwind setup
│   ├── 📂 src/                     # React source code
│   │   ├── 📄 main.jsx              # React entry point
│   │   ├── 📄 App.jsx               # Main component (enhanced)
│   │   ├── 📄 App.css               # Component styles
│   │   └── 📄 index.css             # Global styles
│   └── 📂 public/                  # Static assets
│       └── 📄 wine-glass.svg        # App icon
├── 📂 data/                        # Database files (auto-created)
└── 📂 docs/                        # Project documentation
    ├── 📄 PROJECT_SUMMARY.md       # Development overview
    ├── 📄 DEVELOPMENT_LOG.md       # Session logs
    └── 📄 requirements/             # Feature specifications
```

## 🍷 Wine Knowledge Categories

The app covers 9 comprehensive wine education categories:

1. **Grape Varieties** (8 questions) - Primary grapes and their characteristics
2. **Wine Regions** (12 questions) - Global wine geography and appellations
3. **Viticulture** (6 questions) - Vineyard management and terroir
4. **Winemaking** (6 questions) - Production techniques and processes
5. **Tasting & Analysis** (5 questions) - Sensory evaluation skills
6. **Wine Service** (4 questions) - Professional service standards
7. **Food Pairing** (3 questions) - Wine and cuisine combinations
8. **Wine Laws** (3 questions) - Classification systems and regulations
9. **Special Wines** (3 questions) - Sparkling, fortified, and dessert wines

## 🎯 Learning Progression

### Difficulty Levels
- **Basic**: Recognition and recall (foundational knowledge)
- **Intermediate**: Application and analysis (working professional level)
- **Advanced**: Synthesis and evaluation (expert/sommelier level)

### Target Certifications
- **WSET Level 1-2**: Foundation wine knowledge
- **WSET Level 3**: Advanced wine professional
- **Master Sommelier Level 1**: Service and theory
- **Industry Professional**: Practical wine expertise

## 🛠️ Development Commands

```bash
# Setup (install all dependencies)
npm run setup

# Development (start both server and client)
npm run dev

# Server only
npm run server

# Client only
npm run client

# Production build
npm run build

# Start production server
npm start

# Initialize database (future feature)
npm run db:init
```

## 🔧 Environment Configuration

Create a `.env` file with these variables:

```bash
# Required
NODE_ENV=development
PORT=3001
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Optional
DATABASE_URL=./data/sipschool.db
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_USER_REGISTRATION=true
ENABLE_GUEST_MODE=true
```

## 📊 API Endpoints

### Current Endpoints
```
GET  /api/health                    # Server status
GET  /api/questions                 # All 50 questions
GET  /api/questions/category/:name  # Filter by category
GET  /api/questions/difficulty/:level # Filter by difficulty
GET  /api/questions/random/:count   # Random question subset
GET  /api/categories                # Available categories with stats
```

### Future Authentication Endpoints
```
POST /api/auth/register             # Create account
POST /api/auth/login                # User login
POST /api/auth/guest                # Guest session
GET  /api/auth/verify               # Verify token
POST /api/auth/logout               # End session
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] App loads without errors
- [ ] All 50 questions display correctly
- [ ] Show/hide answer functionality works
- [ ] Score tracking persists between sessions
- [ ] Category filtering functions properly
- [ ] Progress indicators update correctly
- [ ] Mobile layout is responsive
- [ ] Performance is smooth on all devices

### Test on Multiple Devices
- [ ] Desktop Chrome/Firefox/Safari
- [ ] Mobile Chrome/Safari
- [ ] Tablet landscape/portrait
- [ ] Different screen resolutions

## 🚀 Deployment

### Replit Deployment
1. Import project from GitHub
2. Replit auto-detects Node.js
3. Run `npm run setup`
4. Click "Run" or use `npm run dev`
5. Share the generated URL

### Production Considerations
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Enable rate limiting
- Set up proper error logging
- Configure database backups

## 🤝 Contributing

This is currently a personal learning project, but feedback is welcome!

### Providing Feedback
- Test the app and report bugs
- Suggest wine questions or corrections
- Recommend feature improvements
- Share user experience insights

### Question Quality Standards
- All wine facts must be verifiable
- Questions should progress logically in difficulty
- Global wine regions should be represented
- Industry relevance is prioritized

## 📚 Educational Philosophy

### Learning Principles
- **Spaced Repetition**: Review questions at optimal intervals
- **Progressive Difficulty**: Build knowledge systematically
- **Practical Application**: Focus on real-world wine scenarios
- **Comprehensive Coverage**: All aspects of wine knowledge

### Target Audience
- Wine enthusiasts seeking certification-level knowledge
- Restaurant professionals needing wine expertise
- Sommelier certification candidates
- Anyone passionate about wine education

## 🎖️ Certifications Supported

### WSET (Wine & Spirit Education Trust)
- **Level 1**: Basic wine knowledge (foundation)
- **Level 2**: Intermediate wine knowledge (enthusiast)
- **Level 3**: Advanced wine knowledge (professional)

### Court of Master Sommeliers
- **Level 1**: Introductory sommelier course
- **Certified Sommelier**: Professional wine service
- **Advanced Sommelier**: Expert-level knowledge

## 🔮 Roadmap

### Phase 2: Enhanced Features (Weeks 2-3)
- User authentication and profiles
- SQLite database with progress tracking
- Spaced repetition algorithm
- 20-question placement test

### Phase 3: AI Integration (Weeks 3-4)
- Claude API for dynamic question generation
- Intelligent answer processing
- Adaptive difficulty adjustment
- Progressive hint system

### Phase 4: Advanced Features (Weeks 4-6)
- Interactive wine region maps
- Detailed progress analytics
- Achievement system
- Study session insights

### Phase 5: Professional Features (Months 2-3)
- Multi-modal content (images, audio)
- Certification tracking
- Professional sommelier modules
- Industry expert content

## 📞 Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check the `/docs` folder for detailed guides
- **Development Log**: See `DEVELOPMENT_LOG.md` for session notes

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Wine Education**: WSET and Court of Master Sommeliers standards
- **Technical Stack**: React, Node.js, and open-source community
- **AI Assistance**: Claude (Anthropic) for development guidance
- **Platform**: Replit for hosting and development environment

---

**Ready to master wine knowledge?** 🍷

Start your wine education journey today with SipSchool!