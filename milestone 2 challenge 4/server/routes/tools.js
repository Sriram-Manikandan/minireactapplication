const express = require('express');
const router = express.Router();
const prisma = require('../prisma.config');

// GET /tools - Fetch all tools
router.get('/tools', async (req, res) => {
  try {
    const tools = await prisma.tool.findMany();
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /tools - Create a new tool
router.post("/tools", async (req, res) => {
  try {
    const toolData = {
      name: req.body.name,
      description: req.body.description,
      isAvailable: true
    };

    // FIXED: Now properly saves to database using Prisma
    const tool = await prisma.tool.create({
      data: toolData
    });

    res.status(201).json(tool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /tools/:id - Borrow/Return tool
router.patch("/tools/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const existingTool = await prisma.tool.findUnique({ where: { id: parseInt(id) } });
    
    if (existingTool) {
      const updatedTool = await prisma.tool.update({
        where: { id: parseInt(id) },
        data: { isAvailable: !existingTool.isAvailable }
      });
      res.json(updatedTool);
    } else {
      res.status(404).json({ message: "Tool not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
