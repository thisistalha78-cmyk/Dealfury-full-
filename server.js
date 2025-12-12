// ⭐ MUST ADD THIS FIRST (loads Render environment variables)
require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");

app.use(cors());

// Test print to verify if DeepSeek key loads correctly
console.log("Loaded DeepSeek Key:", process.env.DEEPSEEK_API_KEY ? "OK" : "NOT FOUND");

const API_KEY = "bb4940f5be015fe5b1fce30d30be4359c82105d7de6e707b17c8105c81dbcc2b";

// =========================
// ⭐ DEEPSEEK (via OpenRouter)
// =========================
async function deepseekRecommend(products) {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

  if (!DEEPSEEK_API_KEY) {
    console.error("❌ OpenRouter API KEY NOT LOADED");
    return "⚠️ DeepSeek API key missing.";
  }

  const prompt = `
You are an expert at comparing online products.

Your task:
- Read the following product list
- Compare price, rating, and number of reviews
- Write a short friendly summary
- Clearly recommend which product is the BEST DEAL and why

Products:
${JSON.stringify(products, null, 2)}
`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "tngtech/deepseek-r1t2-chimera:free",  // ⭐ FIXED MODEL NAME
        messages: [
          { role: "system", content: "You specialize in product comparison and shopping advice." },
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`, 
          "Content-Type": "application/json",
          "HTTP-Referer": "https://dealfury-full-6.onrender.com", // ⭐ Must match your Render URL
          "X-Title": "DealFury AI"
        }
      }
    );

    return response.data.choices[0].message.content;

  } catch (err) {
    console.error("❌ DeepSeek Error:", err.response?.data || err.message);
    return "⚠️ AI Summary unavailable (DeepSeek Error).";
  }
}

// =========================
// ⭐ ROUTE WITH AI SUMMARY
// =========================
app.get("/api/search", async (req, res) => {
  const q = req.query.q || "";
  try {
    const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(q)}&api_key=${API_KEY}`;
    const response = await axios.get(url);
    const products = response.data.shopping_results || [];

    // ⭐ USE DeepSeek (OpenRouter) to generate summary
    const summary = await deepseekRecommend(products);

    res.json({
      deals: products,
      summary: summary
    });

  } catch (err) {
    console.error("Backend Error:", err);
    res.json({ error: "Backend error", details: err.toString() });
  }
});

app.listen(3000, () => console.log("Backend running on port 3000"));

