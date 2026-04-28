const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let items = [];

app.get('/items', (req, res) => res.json(items));

app.post('/items', (req, res) => {
  items.push(req.body);
  res.json(req.body);
});

app.listen(3000, () => console.log('Server running'));
