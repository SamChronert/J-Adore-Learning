const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../server/index.js');
const content = fs.readFileSync(filePath, 'utf8');

// Find API routes
console.log('=== Finding API routes ===');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('app.') && (line.includes('get') || line.includes('post') || line.includes('put') || line.includes('delete'))) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});

console.log('\n=== File length ===');
console.log(`Total characters: ${content.length}`);
console.log(`Total lines: ${lines.length}`);
