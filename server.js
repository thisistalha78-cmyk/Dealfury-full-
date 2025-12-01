const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");

app.use(cors());

const API_KEY = "bb4940f5be015fe5b1fce30d30be4359c82105d7de6e707b17c8105c81dbcc2b";

app.get("/api/search", async (req, res) => {
  const q = req.query.q || "";
  try {
    const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(q)}&api_key=${API_KEY}`;
    const response = await axios.get(url);
    const products = response.data.shopping_results || [];
    res.json({ deals: products });
  } catch (err) {
    res.json({ error: "Backend error", details: err.toString() });
  }
});

app.listen(3000, () => console.log("Backend running on port 3000"));
