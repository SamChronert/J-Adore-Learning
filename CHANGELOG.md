# 📝 SipSchool Changelog

All notable changes to SipSchool are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - In Development

### 🚧 Phase 2: Core Learning Mechanics

#### Planned Features
- Natural language answer input with text field
- Answer variation support (synonyms, alternate spellings)
- 20-question placement test
- Spaced repetition algorithm (SM-2 based)
- Progressive hint system
- Keyboard navigation support

#### Technical Improvements
- Answer normalization engine
- Fuzzy matching for answers
- Question scheduling system
- Database initialization script

## [1.1.0] - 2025-01-17

### ✅ Added
- **User Authentication System**
  - JWT-based authentication
  - Secure password hashing with bcrypt
  - Guest mode for trying without signup
  - User registration and login
  - Protected API endpoints

- **Database Integration**
  - SQLite database setup
  - User progress tracking
  - Study session logging
  - Secure data persistence

- **Enhanced UI Components**
  - UserHeader component with auth status
  - AuthScreen for login/register
  - Category filtering with stats
  - Session progress tracking
  - Performance indicators

### ✅ Improved
- API structure with auth middleware
- Error handling and user feedback
- Mobile responsiveness
- Code organization with contexts

### 🐛 Fixed
- CORS configuration for auth
- Progress persistence issues
- Category filter state management

## [1.0.0] - 2025-01-15

### ✅ Initial Release

#### Features
- 50 expert wine questions across 9 categories
- Interactive flashcard interface
- Show/hide answer functionality
- Score tracking
- Category filtering
- Progress persistence (localStorage)
- Mobile-responsive design
- Wine-themed gradient UI

#### Content Categories
1. Grape Varieties (8 questions)
2. Wine Regions (12 questions)
3. Viticulture (6 questions)
4. Winemaking (6 questions)
5. Tasting & Analysis (5 questions)
6. Wine Service (4 questions)
7. Food Pairing (3 questions)
8. Wine Laws (3 questions)
9. Special Wines (3 questions)

#### Technical Stack
- React 18 with Vite
- Node.js with Express
- Tailwind CSS
- SQLite (prepared, not active)

## [0.1.0] - 2025-01-10

### 🚀 Project Inception

#### Initial Planning
- Project requirements defined
- Multi-agent AI development framework designed
- Technology stack selected
- Replit deployment strategy chosen

#### Documentation Created
- Project plan
- Requirements summary
- Enhanced requirements with dynamic generation
- Technical implementation guide

---

## Version History Summary

| Version | Date | Status | Key Features |
|---------|------|--------|--------------|
| 0.1.0 | 2025-01-10 | Planning | Project inception and documentation |
| 1.0.0 | 2025-01-15 | Released | MVP with 50 questions and basic features |
| 1.1.0 | 2025-01-17 | Released | Authentication and database integration |
| 2.0.0 | TBD | In Development | Text input, placement test, spaced repetition |
| 3.0.0 | TBD | Planned | AI integration with Claude API |
| 4.0.0 | TBD | Planned | Visual features and maps |
| 5.0.0 | TBD | Planned | Social features and mobile apps |

---

## Migration Guide

### From 1.0.0 to 1.1.0
1. Run `npm install` to get new dependencies (bcrypt, jsonwebtoken)
2. Create `.env` file with required variables
3. Guest mode available - no migration needed for casual users
4. Register account to persist progress across devices

### From 1.1.0 to 2.0.0 (Coming Soon)
1. Database initialization required: `npm run db:init`
2. Placement test recommended for all users
3. Progress will migrate automatically
4. New features will enhance existing functionality

---

**Note**: This changelog tracks both implemented features and planned development to maintain transparency about the project's evolution.