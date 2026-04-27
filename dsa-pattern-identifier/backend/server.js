const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/generate', async (req, res) => {
  const { userInput } = req.body;

  if (!userInput || userInput.trim() === '') {
    return res.status(400).json({ error: 'Please paste a problem statement.' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a DSA tutor. Given a coding problem statement, respond with exactly three sections:

1. Pattern: The DSA pattern that best fits this problem (e.g. Sliding Window, Two Pointers, BFS, DFS, Dynamic Programming, Binary Search, Backtracking, etc.)

2. Why: One or two sentences explaining why this pattern fits.

3. Starting Approach: 3 bullet points describing how to begin solving it.

Be concise and direct. No fluff.`
          },
          {
            role: 'user',
            content: userInput
          }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: 'No response from AI. Check your API key.' });
    }

    res.json({ result: data.choices[0].message.content });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Try again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));