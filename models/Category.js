const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter the name of the category"],
        minlength:2,
        maxlength:50,
    },

    slug:String,
})

module.exports=mongoose.model("Category",categorySchema);