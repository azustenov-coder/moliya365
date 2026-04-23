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

const getMainMenu = (role) => {
  const buttons = [['Hisobot 📈']];
  if (role === 'ADMIN') {
    buttons[0].push('Veb Dashboard 🌐');
  }
  return Markup.keyboard(buttons).resize();
};

bot.start(async (ctx) => {
  const telegramId = String(ctx.from.id);
  const ADMIN_ID = "1178106310"; 

  let user = await prisma.user.findUnique({ where: { telegram_id: telegramId } });

  if (!user) {
    user = await prisma.user.create({
      data: { telegram_id: telegramId, role: telegramId === ADMIN_ID ? 'ADMIN' : 'EMPLOYEE' }
    });
  }

  // Admin bo'lsa va ro'yxatdan o'tgan bo'lsa darhol menyu chiqadi
  if (user.role === 'ADMIN' && user.name && user.phone) {
    return ctx.reply(`Xush kelibsiz, Boss!`, getMainMenu('ADMIN'));
  }

  // Registratsiya boshlanishi
  if (!user.name) {
    state[telegramId] = { step: 'waiting_for_name' };
    return ctx.reply("Assalomu alaykum! Tizimga xush kelibsiz. Ro'yxatdan o'tish uchun Ism va Sharifingizni kiriting (Masalan: Azizbek):");
  }

  if (!user.phone) {
    state[telegramId] = { step: 'waiting_for_phone' };
    return ctx.reply("Rahmat! Endi telefon raqamingizni pastdagi tugmani bosish orqali yuboring:", 
      Markup.keyboard([[Markup.button.contactRequest("📞 Telefon raqamni yuborish")]]).resize().oneTime()
    );
  }

  if (!user.job_title && user.role !== 'ADMIN') {
    state[telegramId] = { step: 'waiting_for_job' };
    return ctx.reply("Oxirgi qadam: Lavozimingizni yozing (Masalan: Sotuvchi, Omborchi va h.k.):", Markup.removeKeyboard());
  }

  ctx.reply(`Ro'yxatdan o'tish muvaffaqiyatli yakunlandi! 👋`, getMainMenu(user.role));
});

bot.command('myid', (ctx) => {
  ctx.reply(`Sizning Telegram ID'ngiz: ${ctx.from.id}`);
});

bot.hears('Veb Dashboard 🌐', async (ctx) => {
  const telegramId = String(ctx.from.id);
  const user = await prisma.user.findUnique({ where: { telegram_id: telegramId } });
  
  if (user.role !== 'ADMIN') {
    return ctx.reply('Kechirasiz, Dashboard faqat Admin uchun ochiq.');
  }

  // Link with direct login userId
  const directLink = `https://moliya365.vercel.app/?auth_id=${user.id}`;
  ctx.reply(`Veb dashboardga havola (Kodsiz kirish):\n${directLink}`);
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

bot.on('contact', async (ctx) => {
  const telegramId = String(ctx.from.id);
  const userState = state[telegramId];

  if (userState?.step === 'waiting_for_phone') {
    const phone = ctx.message.contact.phone_number;
    await prisma.user.update({
      where: { telegram_id: telegramId },
      data: { phone }
    });

    const user = await prisma.user.findUnique({ where: { telegram_id: telegramId } });
    if (user.role === 'ADMIN') {
        delete state[telegramId];
        return ctx.reply("Rahmat, Boss! Hamma ma'lumotlar saqlandi.", getMainMenu('ADMIN'));
    }

    state[telegramId] = { step: 'waiting_for_job' };
    return ctx.reply("Rahmat! Oxirgi qadam: Lavozimingizni yozing (Masalan: Sotuvchi, Omborchi va h.k.):", Markup.removeKeyboard());
  }
});

bot.on('text', async (ctx) => {
  const telegramId = String(ctx.from.id);
  const userState = state[telegramId];

  // Ism yozish jarayoni
  if (userState?.step === 'waiting_for_name') {
    const name = ctx.message.text.trim();
    if (name.length < 2) return ctx.reply("Iltimos, ismingizni to'liqroq yozing:");
    
    await prisma.user.update({
      where: { telegram_id: telegramId },
      data: { name }
    });

    state[telegramId] = { step: 'waiting_for_phone' };
    return ctx.reply("Rahmat! Endi telefon raqamingizni pastdagi tugmani bosish orqali yuboring:", 
        Markup.keyboard([[Markup.button.contactRequest("📞 Telefon raqamni yuborish")]]).resize().oneTime()
    );
  }

  // Lavozim yozish jarayoni
  if (userState?.step === 'waiting_for_job') {
    const job = ctx.message.text.trim();
    const user = await prisma.user.update({
      where: { telegram_id: telegramId },
      data: { job_title: job }
    });

    delete state[telegramId];
    return ctx.reply("Ro'yxatdan o'tish muvaffaqiyatli yakunlandi! 👋", getMainMenu(user.role));
  }

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
