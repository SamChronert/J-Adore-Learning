const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Enhanced question bank with 50 questions across 9 categories
const wineQuestions = [
  // GRAPE VARIETIES (8 questions)
  { 
    id: 1, 
    question: "What is the primary grape variety in Chablis?", 
    answer: "Chardonnay",
    category: "Grape Varieties",
    difficulty: "basic",
    region: "France",
    explanation: "Chablis is made exclusively from Chardonnay grapes, known for its mineral, crisp character due to the Kimmeridgian soil."
  },
  {
    id: 2,
    question: "Which grape is known as Syrah in France and Shiraz in Australia?",
    answer: "Syrah/Shiraz",
    category: "Grape Varieties", 
    difficulty: "basic",
    region: "Global",
    explanation: "The same grape variety is called Syrah in France (especially Rhône Valley) and Shiraz in Australia, producing full-bodied red wines."
  },
  {
    id: 3,
    question: "What grape variety is Sancerre made from?",
    answer: "Sauvignon Blanc",
    category: "Grape Varieties",
    difficulty: "intermediate",
    region: "France",
    explanation: "Sancerre produces crisp, mineral white wines from 100% Sauvignon Blanc grapes grown on limestone soils."
  },
  {
    id: 4,
    question: "Which grape is the primary component of Barolo?",
    answer: "Nebbiolo",
    category: "Grape Varieties",
    difficulty: "intermediate", 
    region: "Italy",
    explanation: "Barolo is made from 100% Nebbiolo grapes, known for high tannins and the ability to age for decades."
  },
  {
    id: 5,
    question: "What is the most widely planted white grape variety in the world?",
    answer: "Chardonnay",
    category: "Grape Varieties",
    difficulty: "basic",
    region: "Global",
    explanation: "Chardonnay is grown in virtually every wine-producing country and can make wines ranging from crisp and mineral to rich and oaky."
  },
  {
    id: 6,
    question: "Which grape variety is Vinho Verde primarily made from?",
    answer: "Alvarinho",
    category: "Grape Varieties",
    difficulty: "advanced",
    region: "Portugal",
    explanation: "While Vinho Verde can be made from several grapes, Alvarinho produces the highest quality whites, especially in the Monção and Melgaço subregions."
  },
  {
    id: 7,
    question: "What grape variety dominates the Right Bank of Bordeaux?",
    answer: "Merlot",
    category: "Grape Varieties",
    difficulty: "intermediate",
    region: "France",
    explanation: "Right Bank appellations like Saint-Émilion and Pomerol are dominated by Merlot, which thrives in the clay soils found there."
  },
  {
    id: 8,
    question: "Which grape is the main component of Amarone?",
    answer: "Corvina",
    category: "Grape Varieties",
    difficulty: "advanced",
    region: "Italy",
    explanation: "Amarone is made primarily from Corvina grapes (45-95%), along with Rondinella and sometimes Molinara, using the appassimento method."
  },

  // WINE REGIONS (12 questions)
  {
    id: 9,
    question: "What color is Beaujolais wine?",
    answer: "Red",
    category: "Wine Regions",
    difficulty: "basic",
    region: "France",
    explanation: "Beaujolais produces red wines made from Gamay grapes, known for their light body and fruity character."
  },
  {
    id: 10,
    question: "Name a Left Bank Bordeaux appellation",
    answer: "Pauillac, Margaux, Saint-Estèphe, Saint-Julien, or Graves",
    category: "Wine Regions",
    difficulty: "intermediate",
    region: "France",
    explanation: "Left Bank appellations are located west of the Gironde and Garonne rivers, known for Cabernet Sauvignon-based wines."
  },
  {
    id: 11,
    question: "Which German region is most famous for Riesling?",
    answer: "Mosel",
    category: "Wine Regions",
    difficulty: "intermediate",
    region: "Germany",
    explanation: "The Mosel region produces some of the world's finest Rieslings, benefiting from steep slate slopes and a cool climate."
  },
  {
    id: 12,
    question: "What is the most important wine region in Argentina?",
    answer: "Mendoza",
    category: "Wine Regions",
    difficulty: "basic",
    region: "Argentina",
    explanation: "Mendoza produces about 75% of Argentina's wine, famous for high-altitude Malbec and excellent growing conditions."
  },
  {
    id: 13,
    question: "Which Burgundy village is famous for Pinot Noir?",
    answer: "Gevrey-Chambertin, Vosne-Romanée, or Chambolle-Musigny",
    category: "Wine Regions",
    difficulty: "advanced",
    region: "France",
    explanation: "These Côte d'Or villages produce some of the world's most expensive and sought-after Pinot Noir wines."
  },
  {
    id: 14,
    question: "What does 'Côtes du Rhône' mean?",
    answer: "Slopes of the Rhône River",
    category: "Wine Regions",
    difficulty: "intermediate",
    region: "France",
    explanation: "The name literally translates to 'slopes/banks of the Rhône,' referring to the vineyards along the Rhône River valley."
  },
  {
    id: 15,
    question: "Which New Zealand region is most famous for Sauvignon Blanc?",
    answer: "Marlborough",
    category: "Wine Regions",
    difficulty: "basic",
    region: "New Zealand",
    explanation: "Marlborough produces about 75% of New Zealand's wine and is globally renowned for its vibrant Sauvignon Blanc."
  },
  {
    id: 16,
    question: "What is the northernmost wine region in Italy?",
    answer: "Alto Adige",
    category: "Wine Regions",
    difficulty: "advanced",
    region: "Italy",
    explanation: "Alto Adige (South Tyrol) borders Austria and produces excellent white wines and Pinot Noir in a cool, alpine climate."
  },
  {
    id: 17,
    question: "Which Spanish region produces Rioja?",
    answer: "La Rioja",
    category: "Wine Regions",
    difficulty: "basic",
    region: "Spain",
    explanation: "La Rioja region in northern Spain is famous for Tempranillo-based red wines with distinctive oak aging classifications."
  },
  {
    id: 18,
    question: "What does 'AVA' stand for in American wine?",
    answer: "American Viticultural Area",
    category: "Wine Regions",
    difficulty: "intermediate",
    region: "USA",
    explanation: "AVAs are designated wine grape-growing regions in the United States, defined by geographic and climatic features."
  },
  {
    id: 19,
    question: "Which Portuguese region produces Port wine?",
    answer: "Douro Valley",
    category: "Wine Regions", 
    difficulty: "intermediate",
    region: "Portugal",
    explanation: "The Douro Valley in northern Portugal is the only region that can legally produce Port wine, with terraced vineyards along the river."
  },
  {
    id: 20,
    question: "What climate is ideal for most premium wine regions?",
    answer: "Mediterranean climate",
    category: "Wine Regions",
    difficulty: "basic",
    region: "Global",
    explanation: "Mediterranean climate provides warm, dry summers and mild, wet winters - ideal for grape ripening and harvest timing."
  },

  // VITICULTURE (6 questions)
  {
    id: 21,
    question: "What is 'terroir'?",
    answer: "The combination of soil, climate, and environment that affects wine character",
    category: "Viticulture",
    difficulty: "basic",
    region: "Global",
    explanation: "Terroir encompasses all environmental factors - soil, climate, topography, and human influence - that give wine its unique character."
  },
  {
    id: 22,
    question: "What does 'biodynamic' farming involve?",
    answer: "Holistic farming following lunar cycles and natural preparations",
    category: "Viticulture",
    difficulty: "intermediate",
    region: "Global",
    explanation: "Biodynamic viticulture treats the vineyard as a living ecosystem, using natural preparations and timing activities with lunar and cosmic rhythms."
  },
  {
    id: 23,
    question: "What is the main purpose of pruning grapevines?",
    answer: "To control yield and improve grape quality",
    category: "Viticulture",
    difficulty: "basic",
    region: "Global",
    explanation: "Pruning limits the number of buds, concentrating the vine's energy into fewer, higher-quality grape clusters."
  },
  {
    id: 24,
    question: "What is 'veraison'?",
    answer: "The onset of grape ripening when grapes change color",
    category: "Viticulture",
    difficulty: "advanced",
    region: "Global",
    explanation: "Veraison marks the beginning of ripening - red grapes turn from green to purple, whites become translucent, and sugar accumulation begins."
  },
  {
    id: 25,
    question: "What type of soil is Chablis famous for?",
    answer: "Kimmeridgian clay with fossilized oyster shells",
    category: "Viticulture",
    difficulty: "advanced",
    region: "France",
    explanation: "Kimmeridgian soil contains limestone and fossilized marine life, giving Chablis its distinctive mineral character."
  },
  {
    id: 26,
    question: "When should grapes ideally be harvested?",
    answer: "When sugar and acid levels are balanced for the desired wine style",
    category: "Viticulture",
    difficulty: "intermediate",
    region: "Global",
    explanation: "Harvest timing balances sugar ripeness with acidity retention, varying by grape variety and intended wine style."
  },

  // WINEMAKING (6 questions)
  {
    id: 27,
    question: "What is malolactic fermentation?",
    answer: "Conversion of sharp malic acid to softer lactic acid",
    category: "Winemaking",
    difficulty: "intermediate",
    region: "Global",
    explanation: "MLF converts malic acid (like green apples) to lactic acid (like milk), softening the wine and adding complexity."
  },
  {
    id: 28,
    question: "What does 'sur lie' aging mean?",
    answer: "Aging wine on its lees (dead yeast cells)",
    category: "Winemaking",
    difficulty: "intermediate",
    region: "Global",
    explanation: "Sur lie aging adds texture, complexity, and subtle flavors from contact with dead yeast cells after fermentation."
  },
  {
    id: 29,
    question: "What is the key difference between red and white winemaking?",
    answer: "Skin contact time - reds ferment with skins, whites typically don't",
    category: "Winemaking",
    difficulty: "basic",
    region: "Global",
    explanation: "Red wines get color and tannins from grape skin contact during fermentation, while whites are usually pressed before fermentation."
  },
  {
    id: 30,
    question: "What is 'bâtonnage'?",
    answer: "Stirring the lees during aging",
    category: "Winemaking",
    difficulty: "advanced",
    region: "Global",
    explanation: "Bâtonnage involves stirring settled lees back into suspension, increasing texture and complexity in white wines."
  },
  {
    id: 31,
    question: "What temperature should red wine typically ferment at?",
    answer: "77-86°F (25-30°C)",
    category: "Winemaking",
    difficulty: "intermediate",
    region: "Global",
    explanation: "This temperature range optimizes color and tannin extraction while preventing excessive alcohol evaporation."
  },
  {
    id: 32,
    question: "What is the purpose of cold stabilization?",
    answer: "To remove tartrate crystals and clarify wine",
    category: "Winemaking",
    difficulty: "advanced",
    region: "Global",
    explanation: "Cold stabilization precipitates tartrate crystals in controlled conditions, preventing them from forming in the bottle."
  },

  // TASTING & ANALYSIS (5 questions)
  {
    id: 33,
    question: "What are the five basic tastes detected on the palate?",
    answer: "Sweet, sour, bitter, salty, umami",
    category: "Tasting & Analysis",
    difficulty: "basic",
    region: "Global",
    explanation: "While wine primarily exhibits sweet (residual sugar), sour (acidity), and bitter (tannins), all five tastes can be present."
  },
  {
    id: 34,
    question: "What do 'legs' or 'tears' on a wine glass indicate?",
    answer: "Alcohol content and glycerol levels",
    category: "Tasting & Analysis",
    difficulty: "intermediate",
    region: "Global",
    explanation: "The viscous drops that form on glass sides indicate higher alcohol content and glycerol, suggesting body and richness."
  },
  {
    id: 35,
    question: "What temperature should Champagne be served?",
    answer: "43-46°F (6-8°C)",
    category: "Tasting & Analysis",
    difficulty: "intermediate",
    region: "France",
    explanation: "This temperature preserves bubbles and acidity while allowing flavors to express properly without being muted by cold."
  },
  {
    id: 36,
    question: "What does 'oxidized' wine smell and taste like?",
    answer: "Nutty, sherry-like, or like bruised apples",
    category: "Tasting & Analysis",
    difficulty: "intermediate",
    region: "Global",
    explanation: "Oxidation occurs when wine is exposed to oxygen, leading to browning and flavors reminiscent of nuts or old apples."
  },
  {
    id: 37,
    question: "What is the ideal serving temperature for light red wines?",
    answer: "55-60°F (13-16°C)",
    category: "Tasting & Analysis",
    difficulty: "intermediate",
    region: "Global",
    explanation: "Slightly chilled service enhances the fresh fruit character of light reds like Pinot Noir and Beaujolais."
  },

  // WINE SERVICE (4 questions)
  {
    id: 38,
    question: "How long should you decant a young Cabernet Sauvignon?",
    answer: "1-2 hours",
    category: "Wine Service",
    difficulty: "intermediate",
    region: "Global",
    explanation: "Young, tannic wines benefit from 1-2 hours of decanting to soften tannins and allow flavors to open up."
  },
  {
    id: 39,
    question: "What type of glass is best for Burgundy?",
    answer: "Large bowl Pinot Noir glass",
    category: "Wine Service",
    difficulty: "intermediate",
    region: "Global",
    explanation: "The large bowl concentrates the delicate aromas of Pinot Noir while the wide opening allows for proper nose access."
  },
  {
    id: 40,
    question: "What is the ideal wine storage temperature?",
    answer: "55°F (13°C)",
    category: "Wine Service",
    difficulty: "basic",
    region: "Global",
    explanation: "This temperature minimizes chemical reactions while preventing cork shrinkage and maintaining wine quality over time."
  },
  {
    id: 41,
    question: "Why should you smell the cork when opening wine?",
    answer: "To check for cork taint or other wine faults",
    category: "Wine Service",
    difficulty: "basic",
    region: "Global",
    explanation: "A moldy or off-smelling cork can indicate TCA contamination or other faults that will affect the wine's quality."
  },

  // FOOD PAIRING (3 questions)
  {
    id: 42,
    question: "What wine pairs best with fresh oysters?",
    answer: "Chablis, Champagne, or Muscadet",
    category: "Food Pairing",
    difficulty: "intermediate",
    region: "Global",
    explanation: "These wines' high acidity and mineral character complement the briny, delicate flavors of fresh oysters."
  },
  {
    id: 43,
    question: "What is the fundamental principle of wine and food pairing?",
    answer: "Match the weight and intensity of wine and food",
    category: "Food Pairing",
    difficulty: "basic",
    region: "Global",
    explanation: "Light wines with light dishes, bold wines with bold dishes - this prevents one from overwhelming the other."
  },
  {
    id: 44,
    question: "What wine traditionally pairs with foie gras?",
    answer: "Sauternes or other sweet wines",
    category: "Food Pairing",
    difficulty: "advanced",
    region: "France",
    explanation: "The sweetness and acidity of Sauternes balances the rich, fatty texture of foie gras in this classic pairing."
  },

  // WINE LAWS & CLASSIFICATIONS (3 questions)
  {
    id: 45,
    question: "What does 'AOC' stand for?",
    answer: "Appellation d'Origine Contrôlée",
    category: "Wine Laws",
    difficulty: "basic",
    region: "France",
    explanation: "AOC is France's quality classification system that controls grape varieties, yields, and winemaking methods by region."
  },
  {
    id: 46,
    question: "What is the German classification 'Prädikatswein'?",
    answer: "Quality wine with special attributes",
    category: "Wine Laws",
    difficulty: "advanced",
    region: "Germany",
    explanation: "Prädikatswein is the highest German wine classification, with six levels based on grape ripeness at harvest."
  },
  {
    id: 47,
    question: "What does 'DOCG' mean in Italian wine law?",
    answer: "Denominazione di Origine Controllata e Garantita",
    category: "Wine Laws",
    difficulty: "intermediate",
    region: "Italy",
    explanation: "DOCG is Italy's highest wine classification, with government testing and a numbered seal guaranteeing authenticity."
  },

  // SPECIAL WINES (3 questions)
  {
    id: 48,
    question: "What method is used to make Champagne?",
    answer: "Méthode Champenoise (Traditional Method)",
    category: "Special Wines",
    difficulty: "intermediate",
    region: "France",
    explanation: "This method involves secondary fermentation in the bottle, creating natural carbonation and complex flavors."
  },
  {
    id: 49,
    question: "What grape variety is primarily used for Sauternes?",
    answer: "Sémillon",
    category: "Special Wines",
    difficulty: "advanced",
    region: "France",
    explanation: "Sémillon's thin skin makes it susceptible to noble rot (Botrytis), essential for Sauternes' concentrated sweetness."
  },
  {
    id: 50,
    question: "What is 'noble rot' called scientifically?",
    answer: "Botrytis cinerea",
    category: "Special Wines",
    difficulty: "advanced",
    region: "Global",
    explanation: "This beneficial fungus dehydrates grapes, concentrating sugars and creating complex flavors in dessert wines."
  }
];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'SipSchool Wine Learning App API is running!',
    questionCount: wineQuestions.length,
    categories: [...new Set(wineQuestions.map(q => q.category))].length
  });
});

// Get all questions
app.get('/api/questions', (req, res) => {
  res.json(wineQuestions);
});

// Get questions by category
app.get('/api/questions/category/:category', (req, res) => {
  const category = req.params.category;
  const categoryQuestions = wineQuestions.filter(q => 
    q.category.toLowerCase() === category.toLowerCase()
  );
  
  if (categoryQuestions.length === 0) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  res.json(categoryQuestions);
});

// Get questions by difficulty
app.get('/api/questions/difficulty/:level', (req, res) => {
  const level = req.params.level;
  const difficultyQuestions = wineQuestions.filter(q => 
    q.difficulty.toLowerCase() === level.toLowerCase()
  );
  
  if (difficultyQuestions.length === 0) {
    return res.status(404).json({ error: 'Difficulty level not found' });
  }
  
  res.json(difficultyQuestions);
});

// Get random questions
app.get('/api/questions/random/:count?', (req, res) => {
  const count = parseInt(req.params.count) || 10;
  const shuffled = [...wineQuestions].sort(() => 0.5 - Math.random());
  res.json(shuffled.slice(0, Math.min(count, wineQuestions.length)));
});

// Get available categories
app.get('/api/categories', (req, res) => {
  const categories = [...new Set(wineQuestions.map(q => q.category))];
  const categoryStats = categories.map(category => {
    const questions = wineQuestions.filter(q => q.category === category);
    const difficulties = [...new Set(questions.map(q => q.difficulty))];
    
    return {
      name: category,
      questionCount: questions.length,
      difficulties: difficulties
    };
  });
  
  res.json(categoryStats);
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🍷 SipSchool server running on port ${PORT}`);
  console.log(`📚 Loaded ${wineQuestions.length} wine questions`);
  console.log(`🗂️  Available categories: ${[...new Set(wineQuestions.map(q => q.category))].join(', ')}`);
});