const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const asyncHandler = require("../utils/asyncHandler");
const generateAIText = require("../utils/generateAIText");

// @desc    Summarize a blog using AI
// @route   POST /api/blogs/:id/summarize
// @access  Private

const summarizeBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate Blog ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid blog ID",
    });
  }

  // Find Blog
  const blog = await Blog.findById(id).select("title content");

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found",
    });
  }

  // Validate Blog Content
  if (!blog.content || !blog.content.trim()) {
    return res.status(400).json({
      success: false,
      message: "Blog content is empty",
    });
  }

  // Prepare AI Prompt
  const prompt = `
    Summarize the following blog in 2-3 concise sentences.

    Instructions:
    - Keep the important information and original meaning.
    - Use simple and clear language.
    - Include only the main points.
    - Do not add information that is not present in the blog.
    - Return only the summary.

    Blog Title: ${blog.title}

    Blog Content:
    ${blog.content}
  `;

  // Generate AI Summary
  const summary = await generateAIText(prompt);

  // Validate AI Response
  if (!summary || !summary.trim()) {
    return res.status(502).json({
      success: false,
      message: "Unable to generate blog summary",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Blog summarized successfully",
    summary: summary.trim(),
  });
});

module.exports = {
  summarizeBlog,
};
