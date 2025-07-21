const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../data/sipschool.db');

// Define wine concepts organized by category
const wineConcepts = [
  // Grape Varieties
  { name: 'Chardonnay', category: 'Grape Varieties', description: 'White grape variety, versatile from crisp to rich styles' },
  { name: 'Cabernet Sauvignon', category: 'Grape Varieties', description: 'Red grape variety, full-bodied with high tannins' },
  { name: 'Pinot Noir', category: 'Grape Varieties', description: 'Red grape variety, light to medium-bodied, elegant' },
  { name: 'Syrah/Shiraz', category: 'Grape Varieties', description: 'Red grape variety, full-bodied with spicy notes' },
  { name: 'Sauvignon Blanc', category: 'Grape Varieties', description: 'White grape variety, crisp with herbaceous notes' },
  { name: 'Merlot', category: 'Grape Varieties', description: 'Red grape variety, medium to full-bodied, soft tannins' },
  { name: 'Riesling', category: 'Grape Varieties', description: 'White grape variety, aromatic, ranges from dry to sweet' },
  { name: 'Tempranillo', category: 'Grape Varieties', description: 'Spanish red grape variety, medium to full-bodied' },
  { name: 'Sangiovese', category: 'Grape Varieties', description: 'Italian red grape variety, high acidity and tannins' },
  { name: 'Nebbiolo', category: 'Grape Varieties', description: 'Italian red grape variety, high tannins and acidity' },
  { name: 'Pinot Grigio/Gris', category: 'Grape Varieties', description: 'White grape variety, light and crisp to rich styles' },
  { name: 'Chenin Blanc', category: 'Grape Varieties', description: 'White grape variety, versatile from dry to sweet' },
  { name: 'Malbec', category: 'Grape Varieties', description: 'Red grape variety, full-bodied with dark fruit flavors' },
  { name: 'Grenache', category: 'Grape Varieties', description: 'Red grape variety, fruity with high alcohol potential' },
  { name: 'Gewürztraminer', category: 'Grape Varieties', description: 'White grape variety, aromatic with lychee and rose notes' },

  // Wine Regions
  { name: 'Bordeaux', category: 'Wine Regions', description: 'French region famous for red blends and sweet wines' },
  { name: 'Burgundy', category: 'Wine Regions', description: 'French region known for Pinot Noir and Chardonnay' },
  { name: 'Champagne', category: 'Wine Regions', description: 'French region producing sparkling wine' },
  { name: 'Rhône Valley', category: 'Wine Regions', description: 'French region known for Syrah and GSM blends' },
  { name: 'Loire Valley', category: 'Wine Regions', description: 'French region with diverse wine styles' },
  { name: 'Tuscany', category: 'Wine Regions', description: 'Italian region home to Chianti and Brunello' },
  { name: 'Piedmont', category: 'Wine Regions', description: 'Italian region known for Barolo and Barbaresco' },
  { name: 'Rioja', category: 'Wine Regions', description: 'Spanish region famous for Tempranillo wines' },
  { name: 'Napa Valley', category: 'Wine Regions', description: 'California region known for premium wines' },
  { name: 'Mosel', category: 'Wine Regions', description: 'German region famous for Riesling' },

  // Viticulture
  { name: 'Terroir', category: 'Viticulture', description: 'Complete natural environment of vineyard' },
  { name: 'Climate Types', category: 'Viticulture', description: 'Mediterranean, Continental, Maritime climates' },
  { name: 'Training Systems', category: 'Viticulture', description: 'VSP, Guyot, Cordon methods' },
  { name: 'Vineyard Diseases', category: 'Viticulture', description: 'Phylloxera, mildew, and other vine diseases' },
  { name: 'Harvest Decisions', category: 'Viticulture', description: 'Timing and methods of grape harvesting' },
  { name: 'Soil Types', category: 'Viticulture', description: 'Limestone, clay, gravel, and other soil types' },

  // Winemaking
  { name: 'Fermentation', category: 'Winemaking', description: 'Alcoholic and malolactic fermentation processes' },
  { name: 'Oak Aging', category: 'Winemaking', description: 'Use of barrels for aging and flavor' },
  { name: 'Clarification', category: 'Winemaking', description: 'Fining and filtering processes' },
  { name: 'Blending', category: 'Winemaking', description: 'Combining different wines or varieties' },
  { name: 'Sur Lie Aging', category: 'Winemaking', description: 'Aging wine on dead yeast cells' },
  { name: 'Fortification', category: 'Winemaking', description: 'Adding spirits to wine' },

  // Wine Service
  { name: 'Serving Temperature', category: 'Wine Service', description: 'Proper temperatures for different wines' },
  { name: 'Decanting', category: 'Wine Service', description: 'Aerating and separating sediment' },
  { name: 'Glassware', category: 'Wine Service', description: 'Proper glass shapes for wine types' },
  { name: 'Wine Storage', category: 'Wine Service', description: 'Proper conditions for aging wine' },
  { name: 'Service Etiquette', category: 'Wine Service', description: 'Professional wine service standards' },

  // Food Pairing
  { name: 'Pairing Principles', category: 'Food Pairing', description: 'Basic rules of food and wine matching' },
  { name: 'Classic Pairings', category: 'Food Pairing', description: 'Traditional food and wine combinations' },
  { name: 'Regional Pairings', category: 'Food Pairing', description: 'Local food with local wine philosophy' },
  { name: 'Texture Matching', category: 'Food Pairing', description: 'Pairing based on weight and texture' },
  { name: 'Flavor Bridging', category: 'Food Pairing', description: 'Using common flavors to connect food and wine' },

  // Wine Laws & Classifications
  { name: 'French Classifications', category: 'Wine Laws & Classifications', description: 'AOC/AOP system and regional classifications' },
  { name: 'Italian Classifications', category: 'Wine Laws & Classifications', description: 'DOC, DOCG, and IGT system' },
  { name: 'Spanish Classifications', category: 'Wine Laws & Classifications', description: 'DO, DOCa, and aging classifications' },
  { name: 'German Classifications', category: 'Wine Laws & Classifications', description: 'Prädikatswein and ripeness levels' },
  { name: 'New World Regulations', category: 'Wine Laws & Classifications', description: 'AVA, GI, and other systems' },

  // Tasting & Analysis
  { name: 'Tasting Technique', category: 'Tasting & Analysis', description: 'Systematic approach to wine evaluation' },
  { name: 'Wine Faults', category: 'Tasting & Analysis', description: 'Cork taint, oxidation, and other defects' },
  { name: 'Aroma Compounds', category: 'Tasting & Analysis', description: 'Chemical compounds creating wine aromas' },
  { name: 'Structure Components', category: 'Tasting & Analysis', description: 'Acidity, tannins, alcohol, body' },
  { name: 'Aging Potential', category: 'Tasting & Analysis', description: 'Factors determining wine longevity' },

  // Special Wines
  { name: 'Sparkling Wines', category: 'Special Wines', description: 'Champagne, Cava, Prosecco production' },
  { name: 'Fortified Wines', category: 'Special Wines', description: 'Port, Sherry, Madeira styles' },
  { name: 'Dessert Wines', category: 'Special Wines', description: 'Late harvest, ice wine, botrytized wines' },
  { name: 'Orange/Amber Wines', category: 'Special Wines', description: 'Skin-contact white wines' },
  { name: 'Natural Wines', category: 'Special Wines', description: 'Minimal intervention winemaking' }
];

async function populateConcepts() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }

      console.log('Connected to database');

      // Insert concepts
      const stmt = db.prepare(`INSERT OR IGNORE INTO concepts (name, category, description) VALUES (?, ?, ?)`);
      
      let insertCount = 0;
      wineConcepts.forEach((concept) => {
        stmt.run(concept.name, concept.category, concept.description, (err) => {
          if (err) {
            console.error(`Error inserting concept ${concept.name}:`, err);
          } else {
            insertCount++;
          }
        });
      });

      stmt.finalize((err) => {
        if (err) {
          console.error('Error finalizing statement:', err);
          reject(err);
        } else {
          console.log(`Inserted ${insertCount} wine concepts`);
          
          // Add some concept relationships
          const relationships = [
            // Grape to Region relationships
            { concept: 'Chardonnay', related: 'Burgundy', type: 'related' },
            { concept: 'Chardonnay', related: 'Champagne', type: 'related' },
            { concept: 'Pinot Noir', related: 'Burgundy', type: 'related' },
            { concept: 'Cabernet Sauvignon', related: 'Bordeaux', type: 'related' },
            { concept: 'Sangiovese', related: 'Tuscany', type: 'related' },
            { concept: 'Nebbiolo', related: 'Piedmont', type: 'related' },
            { concept: 'Tempranillo', related: 'Rioja', type: 'related' },
            
            // Winemaking prerequisites
            { concept: 'Fermentation', related: 'Oak Aging', type: 'prerequisite' },
            { concept: 'Fermentation', related: 'Clarification', type: 'prerequisite' },
            { concept: 'Terroir', related: 'Climate Types', type: 'subtopic' },
            { concept: 'Terroir', related: 'Soil Types', type: 'subtopic' },
            
            // Service relationships
            { concept: 'Serving Temperature', related: 'Wine Storage', type: 'related' },
            { concept: 'Decanting', related: 'Glassware', type: 'related' }
          ];

          // Insert relationships
          const relStmt = db.prepare(`
            INSERT OR IGNORE INTO concept_relationships (concept_id, related_concept_id, relationship_type)
            SELECT c1.id, c2.id, ?
            FROM concepts c1, concepts c2
            WHERE c1.name = ? AND c2.name = ?
          `);

          relationships.forEach((rel) => {
            relStmt.run(rel.type, rel.concept, rel.related, (err) => {
              if (err) {
                console.error(`Error inserting relationship:`, err);
              }
            });
          });

          relStmt.finalize((err) => {
            if (err) {
              console.error('Error finalizing relationships:', err);
            }
            
            db.close((err) => {
              if (err) {
                console.error('Error closing database:', err);
                reject(err);
              } else {
                console.log('Successfully populated wine concepts');
                resolve();
              }
            });
          });
        }
      });
    });
  });
}

// Run the population
populateConcepts()
  .then(() => {
    console.log('Wine concepts populated successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Population failed:', err);
    process.exit(1);
  });