const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");

app.use(cors());

const API_KEY = "bb4940f5be015fe5b1fce30d30be4359c82105d7de6e707b17c8105c81dbcc2b";

// =========================
// ⭐ ADD: DEEPSEEK FUNCTION
// =========================
async function deepseekRecommend(products) {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

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
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You specialize in product comparison and shopping advice." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;

  } catch (err) {
    console.error("DeepSeek Error:", err?.response?.data || err.message);
    return "⚠️ AI Summary unavailable.";
  }
}

// =========================
// ⭐ MODIFY ROUTE to include AI summary
// =========================
app.get("/api/search", async (req, res) => {
  const q = req.query.q || "";
  try {
    const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(q)}&api_key=${API_KEY}`;
    const response = await axios.get(url);
    const products = response.data.shopping_results || [];

    // ⭐ USE DeepSeek to generate summary
    const summary = await deepseekRecommend(products);

    res.json({ 
      deals: products,
      summary: summary  // ⭐ added AI summary
    });

  } catch (err) {
    res.json({ error: "Backend error", details: err.toString() });
  }
});

app.listen(3000, () => console.log("Backend running on port 3000"));
