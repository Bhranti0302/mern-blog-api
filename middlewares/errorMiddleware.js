const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message =
    statusCode === 500
      ? "Internal server Error"
      : err.message || "Something went wrong";

  if (process.env.NODE_ENV === "development") {
    console.error("Actual server error:", err);
  }

  // Mongodb duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate value. Please use a different value.";
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message: "Invalid ID";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired. Please log in again";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorMiddleware;
