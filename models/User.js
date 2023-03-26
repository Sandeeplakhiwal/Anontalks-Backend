import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please enter usename.."]
    },
    avatar: {
        public_id: String,
        url: String
    },
    email:{
        type: String,
        required: [true, "Please enter email.."],
        unique: [true, "email already exists!"]
    },
    password: {
        trype: String,
        required: [true, "Please Enter a Password."],
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
    ],
})

export default mongoose.model('User', userSchema);