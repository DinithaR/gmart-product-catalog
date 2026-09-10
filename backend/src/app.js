require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// CORS allows the Vite dev server on a different port to call this API
app.use(cors());

// Parses incoming JSON request bodies into req.body
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

module.exports = app;