// import express from "express";
// import mongoose from "mongoose";
// import Cors from 'cors';
// import Posts from "../anontalks backend/dbPost.js";

// // App Configuration
// const app = express();
// const port = process.env.PORT || 5000;
// const connection_url = "mongodb+srv://sandeeplakhiwal:XphxQhppElsCfzWR@anontalks-0.ibakyaa.mongodb.net/itsanontalksdb?retryWrites=true&w=majority";

// // Middlewares
// app.use(express.json());
// app.use(Cors());


// // Database Config
// mongoose.connect(connection_url, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })

// // API Endpoints
// app.get("/", (req, res)=>{
//     res.status(200).send("Hello Sandeep Lakhiwal")
// });

// app.post("/api", async (req, res)=>{
//     const dbPost = req.body;
//     try{
//         const newPost = await Posts.create(dbPost);
//         res.status(201).json(newPost);
//         console.log("Here is the new post", newPost);
//     }catch (error) {
//         // If there was an error, handle it here
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//       }
// })

// app.get("/api", async (req, res) => {
//     Posts.find()
//         .then((data) => {
//             res.status(200).send(data)
//             console.log(data);
//         })
//         .catch((error) => {
//             res.status(500).send(error)
//         })
// })

// app.listen(port, ()=> {
//     console.log("server is listening!");
// })


// import { app } from "../anontalks backend/app.js";
// import { connectDatabase } from "./config/database.js";

// connectDatabase();

// app.listen(process.env.PORT, ()=>{
//     console.log(`sever is running on port: ${process.env.PORT}`);
// })

import  app  from "../anontalks backend/app.js";
import { connectDatabase } from "./config/database.js";

const thePORT = process.env.PORT;

connectDatabase();

app.listen(thePORT, ()=>{
    console.log(`Server is listening on Port: ${thePORT}`)
})