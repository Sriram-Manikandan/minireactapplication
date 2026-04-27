const express = require('express');
const router = express.Router();

let recommendations = [];

router.get('/', (req, res) => {
  res.json(recommendations);
});

router.post('/', (req, res) => {
  const { name, category, description } = req.body;
  const rec = { id: Date.now(), name, category, description };
  recommendations.unshift(rec);
  res.json(rec);
});

module.exports = router;