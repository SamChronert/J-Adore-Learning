// Test setup file
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_purposes_only_minimum_32_chars';
process.env.DATABASE_URL = ':memory:'; // Use in-memory SQLite for tests

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Global test utilities
global.testUtils = {
  generateTestUser: (overrides = {}) => ({
    username: 'testuser',
    email: 'test@example.com',
    password: 'testpassword123',
    ...overrides,
  }),
  
  generateTestQuestion: (overrides = {}) => ({
    id: 1,
    question: 'Test question?',
    answer: 'Test answer',
    category: 'Test Category',
    difficulty: 'intermediate',
    ...overrides,
  }),
};

// Cleanup after all tests
afterAll(async () => {
  // Close database connections, etc.
  if (global.testDb) {
    await global.testDb.close();
  }
});