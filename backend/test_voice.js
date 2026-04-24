require('dotenv').config();
const { transcribeAndParse } = require('./ai');
const path = require('path');

async function test() {
  try {
    // Using one of the existing temp files to test
    const testFile = 'temp_1776953273220.ogg';
    console.log("Testing with file:", testFile);
    
    // We need to mock the fileUrl download or just skip it
    // But transcribeAndParse downloads the file. Let's make a temporary test function.
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const fs = require('fs');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    function fileToGenerativePart(filePath, mimeType) {
      return {
        inlineData: {
          data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
          mimeType
        },
      };
    }

    const prompt = `Siz moliyaviy yordamchisiz. Foydalanuvchi kiritgan tekst/ovozdan quyidagilarni ajratib JSON formatda qaytaring:
{
  "type": "income" | "expense" | "debt_to_me" | "debt_from_me",
  "amount": number,
  "category": string (masalan "ovqatlanish", "transport", "oylik", etc.),
  "personName": string | null (agar qarz bo'lsa),
  "comment": string | null
}
Faqat toza JSON formatida natija qaytaring. (Hattoki markdown \`\`\`json yozuvlarisiz).`;

    const audioPart = fileToGenerativePart(testFile, "audio/ogg");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Trying 1.5-flash explicitly
    
    console.log("Sending to Gemini...");
    const result = await model.generateContent([prompt, audioPart]);
    const text = result.response.text();
    console.log("Gemini Response:", text);
    
    const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    console.log("Parsed JSON String:", jsonStr);
    console.log("Final Object:", JSON.parse(jsonStr));
  } catch (err) {
    console.error("Test Error:", err);
  }
}

test();
