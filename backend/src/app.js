require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);

// Any request that matched no route above falls through to here
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Registered last so it receives errors forwarded from every handler above it
app.use(errorHandler);

module.exports = app;