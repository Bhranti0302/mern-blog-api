const mongoose=require('mongoose');
const bcrypt=require("bcryptjs");

const userSchema=new mongoose.Schema({
    user:{
        type:String,
        required:[true,"Please provide a username"],
        minlength:2,
        maxlength:50,
    },
    
    email:{
        type:String,
        required:[true,"Please provide an email"],
        unique:true,
        trim:true,
        lowercase:true,
        match:[/.+@.+\..+/, "Please provide a valid email address"],
    },

    password:{
        type:String,
        required:[true,"Please provide a password"],
        minlength:6,
        maxlength:100,
    }, 

    status:{
        type:String,
        enum:["active","inactive","pending"],
        default:"pending"
    },

    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },

    passwordResetToken:String,
    passwordResetExpires:Date,

    passwordChangedAt:Date,
},{
    timestamps:true
})

userSchema.pre("save",async function(next){
    if(this.isModified("password")) return next();

    const salt=await bcrypt.genSalt(10);

    this.password=await bcrypt.hash(this.password,salt);
    this.passwordChangedAt=Date.now()-1000;
    next();
})

userSchema.methods.comparedPassword=async(async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
})

userSchema.methods.createPasswordResetToken=function(){
    const resetToken=Math.randomBytes(32).toString("hex");

    this.passwordResetToken=crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetTokenExpires=Date.now()+10*60*1000;
    return resetToken;
}

module.exports=mongoose.model("User",userSchema);