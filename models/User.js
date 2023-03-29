import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter User Name"]
    },
    avatar: {
        public_id: String,
        url: String
    },
    email: {
        type: String,
        required: [true, "Please Enter Email id"],
        unique: [true, "email already exists!"]
    },
    password:{
        type: String,
        required: [true, "Please Enter the Password."],
        minlength: [6, "Password must be atleast 6 characters."],
        select: false
    },
    post: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
});

userSchema.pre("save", async function (next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();   
});

userSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = async function(){
    return jwt.sign({_id:this._id}, process.env.JWT_SECRET);
}

export default mongoose.model('User', userSchema);