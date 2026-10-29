const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: 3,
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please add valid email"],
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    trim: true,
    minlength: 6,
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,"Password must contain at least one number and one uppercase and lowercase letter, and at least 6 or more characters"
    ],
    },
  
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
  }
}, {
    timestamps: true,
});

userSchema.pre("save", async () => {
    if (!this.isModified("password")) return;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
});

userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password,this.matchPassword)
}
