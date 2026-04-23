const { Telegraf, Markup } = require('telegraf');
const { PrismaClient } = require('@prisma/client');
const { parseTransaction, transcribeAndParse } = require('./ai');

const prisma = new PrismaClient();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const state = {};

bot.start(async (ctx) => {
  const telegramId = String(ctx.from.id);
  const name = ctx.from.first_name || 'User';

  await prisma.user.upsert({
    where: { telegram_id: telegramId },
    update: { name },
    create: { telegram_id: telegramId, name }
  });

  ctx.reply('Assalomu alaykum! Moliya botiga xush kelibsiz. Menga xarajat yoki daromadingizni yozing yoki ovozli xabar yuboring.');
});

async function processInput(ctx, isVoice) {
  const telegramId = String(ctx.from.id);
  
  const waitMsg = await ctx.reply("Tahlil qilinmoqda... Kuting.");

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
    ctx.telegram.editMessageText(ctx.chat.id, waitMsg.message_id, undefined, "Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
  }
}

bot.on('text', async (ctx) => {
  if (ctx.message.text.startsWith('/')) return;
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
    
    await prisma.transaction.create({
      data: {
        user_id: user.id,
        amount: data.amount,
        type: data.type,
        category_id: category.id,
        comment: data.comment
      }
    });
  } else {
    await prisma.debt.create({
      data: {
        user_id: user.id,
        amount: data.amount,
        type: data.type === 'debt_from_me' ? 'from_me' : 'to_me',
        personName: data.personName || "Noma'lum"
      }
    });
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
