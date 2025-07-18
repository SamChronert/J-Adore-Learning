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
      "It starts with 'C' and has 10 letters"
    ]
  },
  { 
    id: 2, 
    question: "Which grape is known as Syrah in France but has a different name in Australia?", 
    answer: "Shiraz",
    category: "Grape Varieties",
    difficulty: "basic",
    region: "International",
    explanation: "Syrah and Shiraz are the same grape variety. The name 'Shiraz' is primarily used in Australia and South Africa."
  },
  { 
    id: 3, 
    question: "What are the three main grape varieties used in Champagne?", 
    answer: "Chardonnay, Pinot Noir, and Pinot Meunier",
    category: "Grape Varieties",
    difficulty: "intermediate",
    region: "France",
    explanation: "These three grapes make up over 99% of Champagne production, with Pinot Noir providing structure, Chardonnay adding finesse, and Pinot Meunier contributing fruitiness.",
    hints: [
      "One white grape and two red grapes are used",
      "The white grape is the same as in Chablis, the main red grape is famous in Burgundy",
      "The third grape has 'Meunier' (miller in French) in its name"
    ]
  },
  { 
    id: 4, 
    question: "Which Italian grape variety is the most planted grape in Tuscany and the main grape in Chianti?", 
    answer: "Sangiovese",
    category: "Grape Varieties",
    difficulty: "intermediate",
    region: "Italy",
    explanation: "Sangiovese is central Italy's noble grape, forming the backbone of Chianti, Brunello di Montalcino, and Vino Nobile di Montepulciano."
  },
  { 
    id: 5, 
    question: "What is the primary grape variety in red wines from Bordeaux's Left Bank (Médoc)?", 
    answer: "Cabernet Sauvignon",
    category: "Grape Varieties",
    difficulty: "intermediate",
    region: "France",
    explanation: "The gravelly soils of the Left Bank are perfect for Cabernet Sauvignon, which dominates the blends of famous appellations like Pauillac and Saint-Estèphe."
  },
  { 
    id: 6, 
    question: "Which grape variety is known as 'Pinot Grigio' in Italy but 'Pinot Gris' in France?", 
    answer: "Pinot Gris",
    category: "Grape Varieties",
    difficulty: "basic",
    region: "International",
    explanation: "This grape variety is a mutation of Pinot Noir and produces different styles - light and crisp as Pinot Grigio in Italy, fuller and richer as Pinot Gris in Alsace."
  },
  { 
    id: 7, 
    question: "What grape variety is Barolo made from?", 
    answer: "Nebbiolo",
    category: "Grape Varieties",
    difficulty: "intermediate",
    region: "Italy",
    explanation: "Nebbiolo is Piedmont's noble grape, producing some of Italy's most age-worthy wines including Barolo and Barbaresco."
  },
  { 
    id: 8, 
    question: "Which Spanish grape variety is known as Tinta Roriz in Portugal and is a major component of Port wine?", 
    answer: "Tempranillo",
    category: "Grape Varieties",
    difficulty: "advanced",
    region: "Spain/Portugal",
    explanation: "Tempranillo takes many names across Iberia - Tinta Roriz in Portugal, Tinto Fino in Ribera del Duero, and Ull de Llebre in Catalonia."
  },

  // WINE REGIONS (8 questions)
  { 
    id: 9, 
    question: "Which French wine region is famous for its limestone soils called 'Kimmeridgian'?", 
    answer: "Chablis",
    category: "Wine Regions",
    difficulty: "intermediate",
    region: "France",
    explanation: "Chablis' unique Kimmeridgian soil, rich in marine fossils, gives its Chardonnay wines their distinctive mineral character."
  },
  { 
    id: 10, 
    question: "Name the five First Growths (Premiers Crus) of the 1855 Bordeaux Classification.", 
    answer: "Château Lafite Rothschild, Château Latour, Château Margaux, Château Haut-Brion, and Château Mouton Rothschild",
    category: "Wine Regions",
    difficulty: "advanced",
    region: "France",
    explanation: "These five châteaux represent the pinnacle of Bordeaux wine. Mouton Rothschild was elevated from Second Growth to First Growth in 1973."
  },
  { 
    id: 11, 
    question: "Which river separates Bordeaux's Left Bank from Right Bank?", 
    answer: "Gironde",
    category: "Wine Regions",
    difficulty: "intermediate",
    region: "France",
    explanation: "The Gironde estuary, formed by the confluence of the Garonne and Dordogne rivers, divides Bordeaux into its famous Left and Right Banks."
  },
  { 
    id: 12, 
    question: "In which Italian region would you find Barolo and Barbaresco?", 
    answer: "Piedmont",
    category: "Wine Regions",
    difficulty: "basic",
    region: "Italy",
    explanation: "Piedmont in northwest Italy is home to Nebbiolo-based wines including the 'king and queen' of Italian wines: Barolo and Barbaresco."
  },
  { 
    id: 13, 
    question: "What is the most planted wine region in Spain?", 
    answer: "La Mancha",
    category: "Wine Regions",
    difficulty: "intermediate",
    region: "Spain",
    explanation: "La Mancha is not only Spain's largest wine region but also has more vineyard area than any other wine region in the world."
  },
  { 
    id: 14, 
    question: "Which German wine region is largest by area and known for diverse wine styles?", 
    answer: "Rheinhessen",
    category: "Wine Regions",
    difficulty: "intermediate",
    region: "Germany",
    explanation: "Rheinhessen is Germany's largest wine region, producing everything from bulk Liebfraumilch to world-class dry and sweet Rieslings."
  },
  { 
    id: 15, 
    question: "Which prestigious wine region is located between Dijon and Lyon in eastern France?", 
    answer: "Burgundy",
    category: "Wine Regions",
    difficulty: "basic",
    region: "France",
    explanation: "Burgundy (Bourgogne) stretches from Chablis in the north to Beaujolais in the south, with the famous Côte d'Or at its heart."
  },
  { 
    id: 16, 
    question: "What are the two main wine-producing islands of Greece?", 
    answer: "Santorini and Crete",
    category: "Wine Regions",
    difficulty: "advanced",
    region: "Greece",
    explanation: "Santorini is famous for Assyrtiko grown in volcanic soils, while Crete is Greece's largest island with diverse wine production."
  },

  // VITICULTURE (6 questions)
  { 
    id: 17, 
    question: "What is the process of removing excess grape bunches to concentrate flavor in remaining grapes called?", 
    answer: "Green harvest",
    category: "Viticulture",
    difficulty: "intermediate",
    region: "Global",
    explanation: "Green harvest (vendange verte) involves removing grape clusters before ripening to reduce yield and concentrate flavors in the remaining fruit."
  },
  { 
    id: 18, 
    question: "What type of climate is characterized by warm, dry summers and mild, wet winters?", 
    answer: "Mediterranean",
    category: "Viticulture",
    difficulty: "basic",
    region: "Global",
    explanation: "Mediterranean climates are ideal for viticulture, found in regions like Southern France, coastal California, and parts of Australia."
  },
  { 
    id: 19, 
    question: "What is the ideal latitude range for wine grape growing in both hemispheres?", 
    answer: "30 to 50 degrees",
    category: "Viticulture",
    difficulty: "intermediate",
    region: "Global",
    explanation: "Most wine regions fall between 30-50° latitude in both hemispheres, where temperatures are suitable for quality wine grape cultivation."
  },
  { 
    id: 20, 
    question: "What is the training system where vines grow up and along wires called?", 
    answer: "Vertical Shoot Positioning",
    category: "Viticulture",
    difficulty: "intermediate",
    region: "Global",
    explanation: "VSP (Vertical Shoot Positioning) is widely used in quality viticulture, allowing good sun exposure and air circulation through the canopy."
  },
  { 
    id: 21, 
    question: "What vineyard pest devastated European vineyards in the late 19th century?", 
    answer: "Phylloxera",
    category: "Viticulture",
    difficulty: "intermediate",
    region: "Global",
    explanation: "Phylloxera, a root louse from North America, nearly destroyed European viticulture until the solution of grafting onto American rootstocks was discovered."
  },
  { 
    id: 22, 
    question: "What is the French term for the unique combination of soil, climate, and terrain in a vineyard?", 
    answer: "Terroir",
    category: "Viticulture",
    difficulty: "basic",
    region: "France",
    explanation: "Terroir encompasses all environmental factors that give a wine its unique character, a concept central to French wine philosophy."
  },

  // WINEMAKING (6 questions)
  { 
    id: 23, 
    question: "What is the process called when dead yeast cells remain in contact with wine, adding complexity?", 
    answer: "Sur lie aging",
    category: "Winemaking",
    difficulty: "intermediate",
    region: "Global",
    explanation: "Sur lie (on the lees) aging adds texture, complexity, and sometimes a brioche-like character to wines, commonly used in Muscadet and Champagne."
  },
  { 
    id: 24, 
    question: "What is the conversion of tart malic acid to softer lactic acid in wine called?", 
    answer: "Malolactic fermentation",
    category: "Winemaking",
    difficulty: "intermediate",
    region: "Global",
    explanation: "Malolactic fermentation (MLF) softens wine's acidity and can add buttery flavors, especially noticeable in Chardonnay."
  },
  { 
    id: 25, 
    question: "At what temperature range does red wine fermentation typically occur?", 
    answer: "20-32°C",
    category: "Winemaking",
    difficulty: "intermediate",
    region: "Global",
    explanation: "Red wines ferment at warmer temperatures (68-90°F) than whites to extract color and tannins from the grape skins."
  },
  { 
    id: 26, 
    question: "What is the traditional method for making Champagne called?", 
    answer: "Méthode Champenoise",
    category: "Winemaking",
    difficulty: "basic",
    region: "France",
    explanation: "Méthode Champenoise (Traditional Method) involves secondary fermentation in the bottle, creating Champagne's signature fine bubbles."
  },
  { 
    id: 27, 
    question: "What winemaking process involves heating grape must to stop fermentation, retaining residual sugar?", 
    answer: "Fortification",
    category: "Winemaking",
    difficulty: "advanced",
    region: "Global",
    explanation: "Fortification, adding grape spirit to stop fermentation, is used to make Port, Sherry, and other fortified wines with retained sweetness."
  },
  { 
    id: 28, 
    question: "What is the process of mixing different grape varieties or vineyard lots called?", 
    answer: "Blending",
    category: "Winemaking",
    difficulty: "basic",
    region: "Global",
    explanation: "Blending (assemblage in French) allows winemakers to create complexity and balance by combining different components."
  },

  // WINE SERVICE (5 questions)
  { 
    id: 29, 
    question: "At what temperature should full-bodied red wines ideally be served?", 
    answer: "15-18°C",
    category: "Wine Service",
    difficulty: "basic",
    region: "Global",
    explanation: "Full-bodied reds are best at 60-65°F (15-18°C), slightly below room temperature to showcase their complexity without alcohol heat."
  },
  { 
    id: 30, 
    question: "What is the purpose of decanting old wines?", 
    answer: "To separate wine from sediment",
    category: "Wine Service",
    difficulty: "intermediate",
    region: "Global",
    explanation: "Old wines develop sediment that should be separated through careful decanting. Young wines may be decanted for aeration."
  },
  { 
    id: 31, 
    question: "Which type of wine glass is best for serving Burgundy (Pinot Noir)?", 
    answer: "Large bowl glass",
    category: "Wine Service",
    difficulty: "intermediate",
    region: "Global",
    explanation: "Burgundy glasses have a larger, rounder bowl than Bordeaux glasses to capture Pinot Noir's delicate aromas."
  },
  { 
    id: 32, 
    question: "What is double decanting?", 
    answer: "Decanting wine then returning it to the rinsed bottle",
    category: "Wine Service",
    difficulty: "advanced",
    region: "Global",
    explanation: "Double decanting aerates the wine while allowing service from the original bottle, popular in restaurant service."
  },
  { 
    id: 33, 
    question: "How many standard pours (5oz/150ml) are in a 750ml bottle of wine?", 
    answer: "5",
    category: "Wine Service",
    difficulty: "basic",
    region: "Global",
    explanation: "A standard 750ml bottle yields five 5-ounce pours, the typical serving size for wine by the glass."
  },

  // FOOD PAIRING (5 questions)
  { 
    id: 34, 
    question: "Which wine is classically paired with oysters?", 
    answer: "Muscadet",
    category: "Food Pairing",
    difficulty: "intermediate",
    region: "France",
    explanation: "Muscadet's high acidity, minerality, and light body make it the classic pairing for oysters, especially in Loire Valley."
  },
  { 
    id: 35, 
    question: "What is the guiding principle that suggests pairing wines and foods from the same region?", 
    answer: "What grows together goes together",
    category: "Food Pairing",
    difficulty: "basic",
    region: "Global",
    explanation: "This principle recognizes that regional cuisines evolved alongside local wines, creating natural harmonies."
  },
  { 
    id: 36, 
    question: "Which type of wine pairs best with spicy Asian cuisine?", 
    answer: "Off-dry Riesling",
    category: "Food Pairing",
    difficulty: "intermediate",
    region: "Global",
    explanation: "Riesling's touch of sweetness and refreshing acidity cool spicy heat while complementing Asian flavors."
  },
  { 
    id: 37, 
    question: "What style of wine traditionally pairs with foie gras?", 
    answer: "Sauternes",
    category: "Food Pairing",
    difficulty: "advanced",
    region: "France",
    explanation: "The rich sweetness of Sauternes balances foie gras's unctuous texture, a classic Bordeaux pairing."
  },
  { 
    id: 38, 
    question: "Which cheese is classically paired with Port?", 
    answer: "Stilton",
    category: "Food Pairing",
    difficulty: "intermediate",
    region: "UK/Portugal",
    explanation: "The sweet richness of Vintage Port perfectly complements the salty, pungent character of Stilton blue cheese."
  },

  // WINE LAWS & CLASSIFICATIONS (4 questions)
  { 
    id: 39, 
    question: "What does 'DOCG' stand for in Italian wine classification?", 
    answer: "Denominazione di Origine Controllata e Garantita",
    category: "Wine Laws & Classifications",
    difficulty: "intermediate",
    region: "Italy",
    explanation: "DOCG is Italy's highest classification, with strict controls and government testing to guarantee origin and quality."
  },
  { 
    id: 40, 
    question: "In which year was the Bordeaux Classification of the Médoc created?", 
    answer: "1855",
    category: "Wine Laws & Classifications",
    difficulty: "intermediate",
    region: "France",
    explanation: "The 1855 Classification was created for the Paris Universal Exhibition and remains largely unchanged today."
  },
  { 
    id: 41, 
    question: "What is the minimum percentage of a stated grape variety required in U.S. varietal wines?", 
    answer: "75%",
    category: "Wine Laws & Classifications",
    difficulty: "intermediate",
    region: "USA",
    explanation: "U.S. law requires at least 75% of a stated variety, though some states like Oregon require higher percentages (90% for Pinot Noir)."
  },
  { 
    id: 42, 
    question: "What does 'Prädikatswein' represent in German wine classification?", 
    answer: "Quality wine with distinction",
    category: "Wine Laws & Classifications",
    difficulty: "advanced",
    region: "Germany",
    explanation: "Prädikatswein is Germany's highest classification level, based on grape ripeness at harvest, from Kabinett to Trockenbeerenauslese."
  },

  // TASTING & ANALYSIS (4 questions)
  { 
    id: 43, 
    question: "What are the five 'S's of wine tasting in order?", 
    answer: "See, Swirl, Smell, Sip, Savor",
    category: "Tasting & Analysis",
    difficulty: "basic",
    region: "Global",
    explanation: "This systematic approach ensures proper evaluation of wine's appearance, aromas, and flavors."
  },
  { 
    id: 44, 
    question: "What compound causes the 'wet cardboard' smell in corked wine?", 
    answer: "TCA",
    category: "Tasting & Analysis",
    difficulty: "advanced",
    region: "Global",
    explanation: "TCA (2,4,6-trichloroanisole) is the primary compound responsible for cork taint, affecting 3-5% of cork-sealed wines."
  },
  { 
    id: 45, 
    question: "What is the term for the weight and texture of wine in your mouth?", 
    answer: "Body",
    category: "Tasting & Analysis",
    difficulty: "basic",
    region: "Global",
    explanation: "Body describes wine's weight on the palate, from light (like skim milk) to full (like cream), influenced by alcohol, extract, and tannins."
  },
  { 
    id: 46, 
    question: "What aroma compound gives Sauvignon Blanc its characteristic grassy notes?", 
    answer: "Pyrazines",
    category: "Tasting & Analysis",
    difficulty: "advanced",
    region: "Global",
    explanation: "Methoxypyrazines create the green, herbaceous aromas in Sauvignon Blanc and other varieties like Cabernet Franc."
  },

  // SPECIAL WINES (4 questions)
  { 
    id: 47, 
    question: "What is the solera system used for?", 
    answer: "Aging Sherry",
    category: "Special Wines",
    difficulty: "intermediate",
    region: "Spain",
    explanation: "The solera system blends wines of different ages through fractional blending, creating consistency in Sherry production."
  },
  { 
    id: 48, 
    question: "What are the two main styles of Madeira that are heated during production?", 
    answer: "Estufagem and Canteiro",
    category: "Special Wines",
    difficulty: "advanced",
    region: "Portugal",
    explanation: "Estufagem uses heated tanks for 3+ months, while Canteiro ages naturally in warm attics for years, creating Madeira's unique character."
  },
  { 
    id: 49, 
    question: "Which Hungarian wine region is famous for Tokaji Aszú dessert wines?", 
    answer: "Tokaj",
    category: "Special Wines",
    difficulty: "intermediate",
    region: "Hungary",
    explanation: "Tokaj produces the 'wine of kings, king of wines' from botrytized Furmint grapes, measured historically in puttonyos."
  },
  { 
    id: 50, 
    question: "What is the primary grape in Vin Jaune from Jura?", 
    answer: "Savagnin",
    category: "Special Wines",
    difficulty: "advanced",
    region: "France",
    explanation: "Savagnin undergoes biological aging under flor for 6+ years to create Vin Jaune's unique nutty, complex character."
  }
];

// API Routes

// Get all questions
app.get('/api/questions', (req, res) => {
  res.json(wineQuestions);
});

// Get user profile including placement test status
app.get('/api/user/profile', authService.authenticateToken.bind(authService), async (req, res) => {
  try {
    const user = await database.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      placementCompleted: user.placement_completed === 1,
      placementLevel: user.placement_level,
      placementScore: user.placement_score,
      createdAt: user.created_at,
      lastLogin: user.last_login
    });
  } catch (error) {
    console.error('Failed to get user profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update placement test status
app.post('/api/placement/complete', authService.authenticateToken.bind(authService), async (req, res) => {
  try {
    const { level, score, categoryScores } = req.body;
    const userId = req.user.userId;

    // Update user's placement status
    await database.updatePlacementTestStatus(userId, true, level, score);

    // Record in placement_tests table
    if (categoryScores) {
      await database.recordPlacementTest(userId, 20, score, categoryScores, level);
    }

    res.json({
      success: true,
      message: 'Placement test completed',
      level,
      score
    });
  } catch (error) {
    console.error('Failed to update placement test:', error);
    res.status(500).json({ error: 'Failed to update placement test' });
  }
});

// Reset placement test (for retaking)
app.post('/api/placement/reset', authService.authenticateToken.bind(authService), async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Reset placement status
    await database.updatePlacementTestStatus(userId, false, null, null);

    res.json({
      success: true,
      message: 'Placement test reset successfully'
    });
  } catch (error) {
    console.error('Failed to reset placement test:', error);
    res.status(500).json({ error: 'Failed to reset placement test' });
  }
});

// Progress endpoints
app.get('/api/progress', authService.authenticateToken.bind(authService), async (req, res) => {
  try {
    const progress = await database.getUserProgress(req.user.userId);
    res.json(progress);
  } catch (error) {
    console.error('Failed to get progress:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Update progress with spaced repetition
app.post('/api/progress/update', authService.authenticateToken.bind(authService), async (req, res) => {
  try {
    const { questionId, isCorrect, category, difficulty, sessionId, easeFactor, interval, nextReview } = req.body;
    
    if (easeFactor && interval && nextReview) {
      await database.updateUserProgressWithSpacedRepetition(
        req.user.userId, 
        questionId, 
        isCorrect, 
        category, 
        difficulty,
        easeFactor,
        interval,
        nextReview
      );
    } else {
      await database.updateUserProgress(req.user.userId, questionId, isCorrect, category, difficulty);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get questions due for review
app.get('/api/progress/due', authService.authenticateToken.bind(authService), async (req, res) => {
  try {
    const dueQuestions = await database.getDueQuestions(req.user.userId);
    res.json(dueQuestions);
  } catch (error) {
    console.error('Failed to get due questions:', error);
    res.status(500).json({ error: 'Failed to get due questions' });
  }
});

// Statistics endpoint
app.get('/api/stats', authService.authenticateToken.bind(authService), async (req, res) => {
  try {
    const stats = await database.getUserStatistics(req.user.userId);
    res.json(stats);
  } catch (error) {
    console.error('Failed to get statistics:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Study session endpoints
app.post('/api/sessions/start', authService.authenticateToken.bind(authService), async (req, res) => {
  try {
    const sessionId = await database.startStudySession(req.user.userId);
    res.json({ sessionId });
  } catch (error) {
    console.error('Failed to start session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

app.post('/api/sessions/:sessionId/end', authService.authenticateToken.bind(authService), async (req, res) => {
  try {
    const { questionsAnswered, correctAnswers, categoriesStudied } = req.body;
    await database.endStudySession(
      req.params.sessionId, 
      questionsAnswered, 
      correctAnswers, 
      categoriesStudied
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to end session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all route to serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🍷 SipSchool server running on port ${PORT}`);
  console.log(`📍 Visit http://localhost:${PORT} to start learning about wine!`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await database.close();
  process.exit(0);
});
