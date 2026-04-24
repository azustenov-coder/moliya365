require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There is no direct listModels on genAI, we need to use the REST API or another way?
    // Actually the SDK doesn't expose listModels easily.
    // Let's try a different approach. Use the v1 API.
    const https = require('https');
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log("Available Models:", JSON.parse(data));
      });
    });
  } catch (err) {
    console.error(err);
  }
}

listModels();
