const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database and auth
const database = require('./database');
const { setupAuthRoutes } = require('./auth');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Initialize database connection
database.connect().then(() => {
  console.log('📊 Database connected successfully');
}).catch(err => {
  console.error('❌ Database connection failed:', err);
  // Continue running even if database fails (guest mode will still work)
});

// Setup authentication routes
const authService = setupAuthRoutes(app);

// Enhanced question bank with 50 questions across 9 categories - NOW WITH HINTS
const wineQuestions = [
  // GRAPE VARIETIES (8 questions)
  { 
    id: 1, 
    question: "What is the primary grape variety in Chablis?", 
    answer: "Chardonnay",
    category: "Grape Varieties",
    difficulty: "basic",
    region: "France",
    explanation: "Chablis is made exclusively from Chardonnay grapes, known for its mineral, crisp character due to the Kimmeridgian soil.",
    hints: [
      "It's the most widely planted white grape variety in the world",
      "This grape can make wines from crisp and mineral to rich and oaky",
      "It starts with 'C' and has 10