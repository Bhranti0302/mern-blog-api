const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    content: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Blog content is required"],
    },

    category: {
      type: String,
      required: [true, "Blog category is required"],
      enum: [
        "javascript",
        "python",
        "artificial-intelligence",
        "mern-stack",
        "mean-stack",
        "web-development",
        "data-analytics",
        "php",
        "shopify",
        "ui-ux",
        "other",
      ],
    },

    tags: {
      type: [String],
      default: [],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    coverImage: {
      type: String,
      default: null,
    },

    coverImagePublicId: {
      type: String,
      default: null,
    },

    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Blog", blogSchema);
