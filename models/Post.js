const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter the title of the post"],
      minlength: 2,
      maxlength: 100,
    },

    content: {
      type: String,
      required: [true, "Please enter the content of the post"],
      minlength: 10,
      maxlength: 5000,
    },

    slug: {
      type: String,
      unique: true,
    },

    coverImage: {
      type: String,
      required: [true, "Please enter the cover image of the post"],
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    tags: {
      type: [String],
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Post", postSchema);

// Used for:
// 1.Create blog
// 2.Show blogs
// 3.SEO (slug)
// 4.Public/private posts
