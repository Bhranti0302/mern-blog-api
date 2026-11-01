const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
        required: true
    },

    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    content: {
        type: String,
        required: [true, "Comment is required"],
        trim: true,
        minlength: [1, "Comment cannot be empty"],
        maxlength:[1000,"Comment cannot exceed 1000 characters"]
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Comment", commentSchema);

