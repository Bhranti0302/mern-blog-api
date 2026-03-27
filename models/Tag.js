const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 30,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// 🔥 Prevent duplicate tags per user (important)
tagSchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Tag", tagSchema);
