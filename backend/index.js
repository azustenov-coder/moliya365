require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bot = require('./bot');

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

// For MVP, we'll just return data for the first user or pass userId in query
app.get('/api/stats', async (req, res) => {
  try {
    const expenses = await prisma.transaction.aggregate({ where: { type: 'expense' }, _sum: { amount: true } });
    const incomes = await prisma.transaction.aggregate({ where: { type: 'income' }, _sum: { amount: true } });
    
    const totalIncome = incomes._sum.amount || 0;
    const totalExpense = expenses._sum.amount || 0;
    const totalBalance = totalIncome - totalExpense;

    res.json({ totalIncome, totalExpense, totalBalance });
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: { category: true },
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

app.get('/api/debts', async (req, res) => {
  try {
    const debts = await prisma.debt.findMany({ orderBy: { date: 'desc' } });
    res.json(debts);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (process.env.TELEGRAM_BOT_TOKEN) {
      bot.launch()
        .then(() => console.log('Bot is running'))
        .catch(console.error);
    }
});

// Enable graceful stop
process.once('SIGINT', () => { bot.stop('SIGINT'); process.exit(0); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); process.exit(0); });
