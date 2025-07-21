require('dotenv').config();
const ClaudeService = require('../server/services/claudeService');

async function testClaudeAPI() {
  console.log('🧪 Testing Claude API Integration...\n');
  
  // Check if API key is configured
  if (!process.env.CLAUDE_API_KEY || process.env.CLAUDE_API_KEY === 'your_claude_api_key_here') {
    console.error('❌ Claude API key not configured!');
    console.log('Please add your Claude API key to the .env file:');
    console.log('CLAUDE_API_KEY=your_actual_api_key_here\n');
    return;
  }
  
  const claudeService = new ClaudeService();
  
  try {
    console.log('📝 Generating a test question...');
    console.log('Category: Wine Regions');
    console.log('Difficulty: intermediate');
    console.log('User weaknesses: ["French wine regions", "appellations"]\n');
    
    const question = await claudeService.generateQuestion(
      'Wine Regions',
      'intermediate',
      ['French wine regions', 'appellations']
    );
    
    console.log('✅ Question generated successfully!\n');
    console.log('Generated Question:', JSON.stringify(question, null, 2));
    
    // Test cache
    console.log('\n📦 Testing cache (should be instant)...');
    const start = Date.now();
    const cachedQuestion = await claudeService.generateQuestion(
      'Wine Regions',
      'intermediate',
      ['French wine regions', 'appellations']
    );
    const duration = Date.now() - start;
    console.log(`✅ Cache hit! Retrieved in ${duration}ms`);
    
    // Test different category
    console.log('\n📝 Generating question for different category...');
    const question2 = await claudeService.generateQuestion(
      'Grape Varieties',
      'easy',
      []
    );
    console.log('✅ Second question generated!');
    console.log('Question:', question2.question);
    console.log('Answer:', question2.answer);
    
  } catch (error) {
    console.error('❌ Error testing Claude API:', error.message);
    if (error.message.includes('401')) {
      console.log('\n🔑 Invalid API key. Please check your CLAUDE_API_KEY in .env');
    } else if (error.message.includes('429')) {
      console.log('\n⏱️ Rate limit exceeded. Please wait before trying again.');
    }
  }
}

// Run the test
testClaudeAPI();