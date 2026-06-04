const fs = require('fs');
const content = fs.readFileSync('src/app/internal/page.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.toLowerCase().includes('option') || line.toLowerCase().includes('report') || line.toLowerCase().includes('memo') || line.toLowerCase().includes('google doc')) {
    console.log(`Line ${i + 1}: ${line.trim().substring(0, 120)}`);
  }
});
