const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const errorMiddleware = require("./middlewares/errorMiddleware")

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes")

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
app.use("/api/auth", authRoutes)
app.use("/api/user",userRoutes)

// Handle unknown routes
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error)
})

// Global error handler 
app.use(errorMiddleware)

module.exports = app;
