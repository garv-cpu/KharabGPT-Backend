// server/server.mjs
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { CronJob } from "cron";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/api/gemini-vision", async (req, res) => {
  const { base64Image, userGoal } = req.body;

  if (!base64Image) {
    return res.status(400).json({ error: "Image is required" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Analyze this meal photo and respond in structured sections:
- Ingredients (as a bullet list)
- Estimated Calories (number)
- Nutritional Notes (brief sentence)
- Goal Match Analysis: Does it fit the goal '${
                  userGoal || "weight loss"
                }'? Why or why not?

Respond clearly in markdown style.`,
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!result) {
      console.error("Gemini Error: Invalid response", data);
      return res
        .status(500)
        .json({ error: "Gemini did not return valid data" });
    }

    res.json({ result });
  } catch (err) {
    console.error("Gemini Vision API Error:", err);
    res.status(500).json({ error: "Gemini API call failed" });
  }
});

app.get("/ping", (req, res) => {
  res.send("🏓 Pong from Fork AI backend!");
});

const job = new CronJob(
  "*/14 * * * *", // Every 14 minutes
  async () => {
    const pingUrl = "https://kharabgpt-backend.onrender.com/ping"; // replace with actual Render URL

    try {
      const res = await fetch(pingUrl);
      const text = await res.text();
      console.log(
        "🔁 Keep-alive ping success:",
        text,
        new Date().toLocaleString()
      );
    } catch (err) {
      console.error("🔻 Keep-alive ping failed:", err);
    }
  },
  null,
  true,
  "Asia/Kolkata"
);

job.start();

app.listen(3001, () => {
  console.log("✅ Fork AI backend (Gemini) running at http://localhost:3001");
});
