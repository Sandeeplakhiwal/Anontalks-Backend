import express from "express";
import dotenv from 'dotenv';

const app = express();



// dotenv.config({path: "./config/config.env"});


if(process.env.NODE_ENV !== "production"){
    dotenv.config({path: "./config/config.env"});
}

// Using MiddleWares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Importing Routes
import post from "../anontalks backend/routes/post.js";
import user from "../anontalks backend/routes/user.js";


// Using Routes
app.use("/api/v1", post);
app.use("/api/v1", user);


export { app };