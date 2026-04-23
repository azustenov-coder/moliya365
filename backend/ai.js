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
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await retry(() => model.generateContent([prompt, textInput]));
    const text = result.response.text();
    const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("AI parseTransaction Error, triggering simple fallback:", err.message);
    
    // Simple basic Regex fallback for basic Uzbek inputs when API rate limits are hit
    const text = textInput.toLowerCase();
    
    // Check for "qarz berdim" (I gave debt - from_me)
    const qarzBerdimMatch = text.match(/([a-z]+)ga (\d+)(?: ?ming)? qarz berdim/i);
    if (qarzBerdimMatch) {
       const amountStr = qarzBerdimMatch[2] + (text.includes("ming") ? "000" : "");
       return { type: "debt_from_me", amount: Number(amountStr), category: "qarz", personName: qarzBerdimMatch[1], comment: "Kesh xotira orqali kiritilgan" };
    }
    
    // Check for "qarz oldim" (I took debt - to_me)
    const qarzOldimMatch = text.match(/([a-z]+)dan (\d+)(?: ?ming)? qarz oldim/i);
    if (qarzOldimMatch) {
       const amountStr = qarzOldimMatch[2] + (text.includes("ming") ? "000" : "");
       return { type: "debt_to_me", amount: Number(amountStr), category: "qarz", personName: qarzOldimMatch[1], comment: "Kesh xotira orqali kiritilgan" };
    }

    // Check basic numbers for expense
    const rawNumberMatch = text.match(/(\d+)(?: ?ming)?/);
    if (rawNumberMatch) {
       const amt = Number(rawNumberMatch[1] + (text.includes("ming") ? "000" : ""));
       return { type: "expense", amount: amt, category: "Umumiy", personName: null, comment: text };
    }

    throw new Error("I could not parse this offline");
  }
}

async function generateInsights(transactions) {
  if (!transactions || transactions.length === 0) {
    return {
      insight: "Hozircha xarajatlar va kirimlar yetarli emas. Tahlil uchun ko'proq tranzaksiya kiriting.",
      growth: "Ma'lumot kam bo'lganligi uchun ijobiy o'sishni hisoblay olmaymiz.",
      advice: "Telegram botingiz orqali doimiy ravishda kirim va chiqimlarni kiritib boring."
    };
  }
  
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  
  const dataSummary = transactions.map(t => `${t.type === 'income' ? 'Kirim' : 'Chiqim'}: ${t.amount} UZS - ${t.category?.name || 'Boshqa'} (${t.comment || ''})`).join('\n');
  
  const insightPrompt = `Siz professional moliyaviy tahlilchisiz. Quyidagi so'nggi tranzaksiyalar (Kirim/Chiqim) ro'yxatini tahlil qiling va biznes/shaxsiy byudjet haqida 3 xil tahlil bering:
${dataSummary}

Qat'iy JSON formatida qaytaring:
{
  "insight": "Joriy davrda eng katta xarajat nima bo'lganiga yoki e'tibor berish kerak bo'lgan sohasiga qisqa xulosa (Misol: Joriy oyda qahvaga sarf 15% oshdi).",
  "growth": "Kirim marjasi qanday, ijobiy o'zgarish bormi yoki yoqmi (Misol: O'tgan haftaga nisbatan daromad yaxshilandi).",
  "advice": "Kelajakda mablag'larni optimallashtirish uchun qisqacha tavsiya."
}
Faqat toza JSON formatida natija qaytaring.`;

  const result = await retry(() => model.generateContent(insightPrompt));
  const text = result.response.text();
  const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  try {
     return JSON.parse(jsonStr);
  } catch (err) {
     console.error("AI Insight JSON parse Error", text);
     return {
         insight: "Joriy oy xarajatlari o'zgaruvchanlikka ega. Diqqat bilan tahlil qiling.",
         growth: "Daromad dinamikasi hisoblanmoqda...",
         advice: "Xarajatlaringizni tizimli ravishda kiritishni davom eting."
     }
  }
}

module.exports = { parseTransaction, transcribeAndParse, generateInsights };
