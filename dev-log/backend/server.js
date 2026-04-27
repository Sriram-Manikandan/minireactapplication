const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Schema & Model ---
const logSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  type:     { type: String, enum: ['bug', 'learning'], required: true },
  details:  { type: String, required: true },
  language: { type: String, required: true },
  date:     { type: Date, default: Date.now }
});

const Log = mongoose.model('Log', logSchema);

// --- Health check ---
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// --- CREATE ---
app.post('/logs', async (req, res) => {
  try {
    const log = new Log(req.body);
    const saved = await log.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- READ ---
app.get('/logs', async (req, res) => {
  try {
    const logs = await Log.find().sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- UPDATE ---
app.put('/logs/:id', async (req, res) => {
  try {
    const updated = await Log.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Log not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- DELETE ---
app.delete('/logs/:id', async (req, res) => {
  try {
    const deleted = await Log.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Log not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));