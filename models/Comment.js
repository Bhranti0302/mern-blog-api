const mongoose=require("mongoose");

const commentSchema=new mongoose.Schema({
    content:{
        type:String,
    },

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User", 
    },

    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
    }
},{
    timestamps:true,
})

module.exports=mongoose.model("Comment",commentSchema);

//Enables:
// 1.Comments under blog
// 2.Discussions