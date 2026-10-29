const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes")

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Test Routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Blog API is running",
  });
});

// Routes
app.use("/api/auth",authRoutes)


module.exports = app;
