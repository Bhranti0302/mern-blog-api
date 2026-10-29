const mongoose = require("mongoose");

const connectDB = async (uri = process.env.MONGO_URI) => {
    try {
        await mongoose.connect(uri);
        console.log("Mongodb connect successfully")
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`)
    }
}

module.exports=connectDB