require('dotenv').config();
const https = require('https');
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const models = JSON.parse(data).models;
    const genModels = models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
    console.log("Generation Models:");
    genModels.forEach(m => console.log(`- ${m.name}`));
  });
});
