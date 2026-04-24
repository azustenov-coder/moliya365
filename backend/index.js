require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bot = require('./bot');

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());
// Auto-access for development (no code needed)
app.get('/api/init', async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId || "" } });
    if (user) {
      res.json({ success: true, userId: user.id, name: user.name, role: user.role });
    } else {
      res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
    }
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Auth endpoint
app.post('/api/login', async (req, res) => {
  const { code } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        auth_code: code,
        auth_expires: { gte: new Date() }
      }
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { auth_code: null, auth_expires: null }
      });
      res.json({ success: true, userId: user.id, telegramId: user.telegram_id, name: user.name, role: user.role });
    } else {
      res.status(401).json({ success: false, message: "Noto'g'ri yoki muddati o'tgan kod" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/stats', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId required" });
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Admin sees everything, Employee sees only theirs
    const filter = user.role === 'ADMIN' ? {} : { user_id: userId };

    const expenses = await prisma.transaction.aggregate({ where: { ...filter, type: 'expense' }, _sum: { amount: true } });
    const incomes = await prisma.transaction.aggregate({ where: { ...filter, type: 'income' }, _sum: { amount: true } });
    
    res.json({ 
      totalIncome: incomes._sum.amount || 0, 
      totalExpense: expenses._sum.amount || 0, 
      totalBalance: (incomes._sum.amount || 0) - (expenses._sum.amount || 0) 
    });
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

app.get('/api/transactions', async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const filter = user?.role === 'ADMIN' ? {} : { user_id: userId };

    const transactions = await prisma.transaction.findMany({
      where: filter,
      include: { category: true, user: true }, // Include user to see who added it
      orderBy: { date: 'desc' },
      take: 50
    });
    res.json(transactions);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

app.get('/api/debts', async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const filter = user?.role === 'ADMIN' ? {} : { user_id: userId };

    const debts = await prisma.debt.findMany({ 
      where: filter,
      include: { user: true },
      orderBy: { date: 'desc' } 
    });
    res.json(debts);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

app.get('/api/debts/summary', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId required" });
  try {
    const debts = await prisma.debt.findMany({ where: { user_id: userId } });
    const berilgan = debts.filter(d => d.type === 'from_me').reduce((sum, d) => sum + d.amount, 0);
    const olingan = debts.filter(d => d.type === 'to_me').reduce((sum, d) => sum + d.amount, 0);
    res.json({ berilgan, olingan });
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

const insightCache = {};

app.get('/api/insights', async (req, res) => {
  const { userId, force } = req.query;
  if (!userId) return res.status(400).json({ error: "userId required" });
  
  // Cache mechanism: keeps AI response for 15 minutes to make page load instant!
  if (!force && insightCache[userId] && (Date.now() - insightCache[userId].timestamp < 15 * 60 * 1000)) {
    return res.json(insightCache[userId].data);
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: { user_id: userId },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: 50
    });
    
    const aiModule = require('./ai');
    const insights = await aiModule.generateInsights(transactions);
    
    insightCache[userId] = {
       data: insights,
       timestamp: Date.now()
    };
    
    res.json(insights);
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: "Insight generation failed" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    if (process.env.TELEGRAM_BOT_TOKEN) {
      bot.launch()
        .then(() => console.log('Bot is running'))
        .catch(console.error);
    }
});

process.once('SIGINT', () => { bot.stop('SIGINT'); process.exit(0); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); process.exit(0); });
