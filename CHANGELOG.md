# Changelog

All notable changes to SipSchool will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-01-21

### Added
- **Authentication & Profile System**
  - Auto-login after registration for seamless user experience
  - ProfileIndicator component with dropdown menu in top-right corner
  - Comprehensive Profile page at `/profile` route
  - User-specific API key management with AES-256-CBC encryption
  - ApiKeyNotification banner for users without API keys
  
- **Advanced Knowledge Tracking System**
  - Database schema with 6 new tables for knowledge tracking
  - 75+ wine concepts across 9 categories
  - KnowledgeTrackingService with sophisticated algorithms:
    - Exponential moving average for mastery calculation
    - Learning velocity tracking
    - Confidence scores with decay
    - Automatic knowledge gap identification
    - Prerequisite-based concept recommendations
  
- **UI Components**
  - HintButton component for manual hint requests
  - Enhanced QuestionCard with single-attempt system
  - Profile page with learning statistics
  - Dismissible notification system

### Changed
- **Answer System Overhaul**
  - Reduced from 4 attempts to single attempt only
  - Changed from automatic hints to manual hint button
  - Hints disabled after answer submission
  - Immediate feedback after submission
  
- **Infrastructure Improvements**
  - Increased Claude API rate limit from 10 to 50 requests per 15 minutes
  - Made rate limits configurable via environment variables
  - Updated Claude service to support user-specific API keys

### Fixed
- Registration flow now automatically logs users in
- API endpoints now properly use user-specific API keys when available
- Improved error handling for API key validation

### Security
- Implemented AES-256-CBC encryption for API key storage
- Added proper key validation for Claude API format
- Encryption keys configurable via environment variables

## [2.1.0] - 2025-01-20

### Added
- Claude AI integration for dynamic question generation
- Comprehensive testing suite with 80+ tests
- User feedback system with 5-star ratings
- Admin dashboard for feedback management
- Rate limiting for API endpoints
- Batch question generation support

### Changed
- Enhanced answer matching with synonym database
- Improved hint system with 3 progressive levels
- Optimized database queries for performance

### Fixed
- Session tracking accuracy
- Progress persistence for authenticated users
- Category filtering edge cases

## [2.0.0] - 2025-01-19

### Added
- Complete rewrite with React frontend
- SQLite database for persistent storage
- JWT-based authentication system
- Placement test for skill assessment
- Spaced repetition algorithm (SM-2 inspired)
- Category-based learning paths
- Mobile-responsive design

### Changed
- Migrated from static HTML to full-stack application
- Improved question bank to 50 expert-curated questions
- Enhanced progress tracking with detailed analytics

## [1.0.0] - 2025-01-18

### Added
- Initial release with basic quiz functionality
- 20 wine questions across multiple categories
- Score tracking
- Basic hint system