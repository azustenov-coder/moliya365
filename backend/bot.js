const { Telegraf, Markup } = require('telegraf');
const { PrismaClient } = require('@prisma/client');
const { parseTransaction, transcribeAndParse } = require('./ai');
const { subDays, startOfDay } = require('date-fns');

const prisma = new PrismaClient();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const state = {};

const notifyFrontend = (event, data) => {
  console.log(`[Pusher Mock] Triggered event: ${event}`, data);
};

const mainMenu = Markup.keyboard([
  ['Hisobot 📈', 'Veb Dashboard 🌐']
]).resize();

bot.start(async (ctx) => {
  const telegramId = String(ctx.from.id);
  const name = ctx.from.first_name || 'User';

  await prisma.user.upsert({
    where: { telegram_id: telegramId },
    update: { name },
    create: { telegram_id: telegramId, name }
  });

  ctx.reply('Assalomu alaykum! Premium Moliya botiga xush kelibsiz. Matn yoki ovoz yozing.', mainMenu);
});

bot.hears('Veb Dashboard 🌐', async (ctx) => {
  ctx.reply(`Veb-panelga havola: http://localhost:3001\nHech qanday kod shart emas, saytga kirishingiz bilan ma'lumotlaringiz yuklanadi!`);
});

bot.hears('Hisobot 📈', (ctx) => {
  ctx.reply('Statistika davrini tanlang:', 
    Markup.inlineKeyboard([
      [Markup.button.callback('1 haftalik statistika', 'stats_week')],
      [Markup.button.callback('1 oylik statistika', 'stats_month')]
    ])
  );
});

async function getStats(telegramId, days) {
  const user = await prisma.user.findUnique({ where: { telegram_id: String(telegramId) } });
  if (!user) return "Foydalanuvchi topilmadi.";

  const startDate = startOfDay(subDays(new Date(), days));

  const transactions = await prisma.transaction.findMany({
    where: {
      user_id: user.id,
      date: { gte: startDate }
    }
  });

  const debts = await prisma.debt.findMany({
    where: {
      user_id: user.id,
      date: { gte: startDate }
    }
  });

  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  const debtGiven = debts.filter(d => d.type === 'from_me').reduce((sum, d) => sum + d.amount, 0);
  const debtTaken = debts.filter(d => d.type === 'to_me').reduce((sum, d) => sum + d.amount, 0);

  const kassa = income - expense;
  const sofYigindi = kassa + debtGiven - debtTaken;

  return `📊 *${days} kunlik MOLIYAVIY HISOBOT:*\n\n💰 Jami Kirim: ${income.toLocaleString()} UZS\n💸 Jami Chiqim: ${expense.toLocaleString()} UZS\n⚖️ Kassa balans: ${kassa.toLocaleString()} UZS\n\n🔄 *Olingan qarzlar:* ${debtTaken.toLocaleString()} UZS (Sizning majburiyatlaringiz)\n📤 *Berilgan qarzlar:* ${debtGiven.toLocaleString()} UZS (Undirilishi kerak bo'lgan aktivlar)\n\n💎 *Sof Umumiy Qoldiq:* ${sofYigindi.toLocaleString()} UZS`;
}

bot.action('stats_week', async (ctx) => {
  const text = await getStats(ctx.from.id, 7);
  ctx.replyWithMarkdown(text);
  ctx.answerCbQuery();
});

bot.action('stats_month', async (ctx) => {
  const text = await getStats(ctx.from.id, 30);
  ctx.replyWithMarkdown(text);
  ctx.answerCbQuery();
});

async function processInput(ctx, isVoice) {
  const telegramId = String(ctx.from.id);
  const waitMsg = await ctx.reply("Tahlil qilinmoqda...");

  try {
    let data;
    if (isVoice) {
      const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
      data = await transcribeAndParse(link.href);
    } else {
      data = await parseTransaction(ctx.message.text);
    }
    
    state[telegramId] = { ...data, telegramId };
    
    let confirmationText = '';
    if (data.type === 'expense' || data.type === 'income') {
      confirmationText = `${data.amount} so'm ${data.category} kategoriyasiga '${data.type === 'expense' ? 'chiqim' : 'kirim'}' qilib qo'shilsinmi?`;
    } else {
      confirmationText = `${data.amount} so'm qarz (${data.personName} dan/ga) ro'yxatga olinsinmi?`;
    }

    ctx.telegram.editMessageText(ctx.chat.id, waitMsg.message_id, undefined, confirmationText, 
      Markup.inlineKeyboard([
        Markup.button.callback("Ha", "confirm_transaction"),
        Markup.button.callback("Yo'q", "cancel_transaction")
      ])
    );
  } catch (error) {
    console.error(error);
    ctx.telegram.editMessageText(ctx.chat.id, waitMsg.message_id, undefined, "Xatolik yuz berdi.");
  }
}

bot.on('text', async (ctx) => {
  if (ctx.message.text.startsWith('/') || ['Hisobot 📈', 'Veb Dashboard 🌐'].includes(ctx.message.text)) return;
  await processInput(ctx, false);
});

bot.on('voice', async (ctx) => {
  await processInput(ctx, true);
});

bot.action('confirm_transaction', async (ctx) => {
  const telegramId = String(ctx.from.id);
  const data = state[telegramId];

  if (!data) return ctx.reply("Ma'lumot topilmadi.");

  const user = await prisma.user.findUnique({ where: { telegram_id: telegramId } });

  if (data.type === 'expense' || data.type === 'income') {
    let category = await prisma.category.findFirst({ where: { name: data.category, type: data.type } });
    if (!category) {
      category = await prisma.category.create({ data: { name: data.category, type: data.type, isCustom: true } });
    }
    
    const tx = await prisma.transaction.create({
      data: {
        user_id: user.id,
        amount: data.amount,
        type: data.type,
        category_id: category.id,
        comment: data.comment
      }
    });
    notifyFrontend('new-transaction', tx);
  } else {
    const debt = await prisma.debt.create({
      data: {
        user_id: user.id,
        amount: data.amount,
        type: data.type === 'debt_from_me' ? 'from_me' : 'to_me',
        personName: data.personName || "Noma'lum"
      }
    });
    notifyFrontend('new-debt', debt);
  }

  delete state[telegramId];
  ctx.editMessageText("Saqlandi!");
});

bot.action('cancel_transaction', (ctx) => {
  const telegramId = String(ctx.from.id);
  delete state[telegramId];
  ctx.editMessageText("Bekor qilindi.");
});

module.exports = bot;
