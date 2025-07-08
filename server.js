// server/server.mjs
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free', // Free, good with instructions and natural tone
        messages: [
          {
            role: 'system',
            content: 'You are BharatGPT — an Indian AI chat assistant. You understand Hinglish, Tamil, Hindi, Telugu, and Indian slang. Respond like a helpful friend from India with empathy and clarity.'
          },
          ...messages
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('AI Error: Invalid or incomplete response', data);
      return res.status(500).json({ error: 'AI did not return a valid result.' });
    }

    const result = data.choices[0].message.content;
    res.json({ result });

  } catch (error) {
    console.error('BharatGPT API Error:', error);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

app.listen(3001, () => {
  console.log('✅ BharatGPT backend running at http://localhost:3001');
});
