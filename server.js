const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // or use native fetch in Node 18+
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Securely store your API key in .env
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log(process.env.OPENAI_API_KEY)


app.post('/api/ai-analyze', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an AI assistant that analyzes onboarding feedback.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', errorText);
      return res.status(500).json({ error: 'AI service error', details: errorText });
    }
    const result = await response.json();
    const analysis = result.choices?.[0]?.message?.content || 'No analysis available.';
    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));