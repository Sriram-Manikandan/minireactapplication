const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { calculateScore } = require('../utils/scoreHelper');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const getScore = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany();
    const value = calculateScore(tasks);
    res.json({ value });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch score' });
  }
};

module.exports = { getScore };