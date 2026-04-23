const { GoogleGenerativeAI } = require("@google/generative-ai");
const https = require('https');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
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

async function retry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (e) {
    if (retries > 0 && (e.status === 429 || e.status === 503)) {
      await new Promise(r => setTimeout(r, delay));
      return retry(fn, retries - 1, delay * 2);
    }
    throw e;
  }
}

async function transcribeAndParse(fileUrl) {
  const tempPath = path.join(__dirname, `temp_${Date.now()}.ogg`);
  await downloadFile(fileUrl, tempPath);
  
  const audioPart = fileToGenerativePart(tempPath, "audio/ogg");
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  
  const result = await retry(() => model.generateContent([prompt, audioPart]));
  const text = result.response.text();
  
  fs.unlinkSync(tempPath);
  
  const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(jsonStr);
}

async function parseTransaction(textInput) {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const result = await retry(() => model.generateContent([prompt, textInput]));
  const text = result.response.text();
  
  const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(jsonStr);
}

module.exports = { parseTransaction, transcribeAndParse };
