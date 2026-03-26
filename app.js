const express=require("express");
const app=express();
app.use(express.json());

// Routes
app.get("/",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"API is running..."
    })
})

// Global error handler
app.use((err,req,res,next)=>{
    app.status(err.statusCode || 500).json({
        success:false,
        message:err.message || "Server Error",
    })
})

module.exports=app;