require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

async function test() {
  try {
    const testFile = 'temp_1776953273220.ogg';
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    function fileToGenerativePart(filePath, mimeType) {
      return {
        inlineData: {
          data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
          mimeType
        },
      };
    }

    const audioPart = fileToGenerativePart(testFile, "audio/ogg");
    
    // Testing with gemini-1.5-flash-latest
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    console.log("Sending to Gemini (gemini-1.5-flash-latest)...");
    const result = await model.generateContent(["Identify the amount and category in this audio", audioPart]);
    console.log("Gemini Response:", result.response.text());
  } catch (err) {
    console.error("Test Error:", err);
  }
}

test();
