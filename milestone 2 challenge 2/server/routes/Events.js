const express = require('express');
const router = express.Router();

let events = [];

router.get('/', (req, res) => {
  res.json(events);
});

router.post('/', (req, res) => {
  const { title, description, date, location } = req.body;
  const event = { id: Date.now(), title, description, date, location };
  events.unshift(event);
  res.json(event);
});

module.exports = router;