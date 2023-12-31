import express from "express";
import { config } from "dotenv";
// import cors from "cors"
import cookieParser from "cookie-parser";

// IMPORTING ROUTES
import userRouter from "../anontalks backend/routes/user.js";
import postRouter from "../anontalks backend/routes/post.js";

const app = express();

config({
  path: "./config/config.env",
});

// if(process.env.NODE_ENV !== "production"){
//     dotenv.config({path: "./config/config.env"});
// }

// USING MIDDLEWARES
// app.use(express.json({ limit: "50mb" }));
app.use(express.json());
// app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
// app.use(cors);

// USING ROUTES
app.use("/api/v1", userRouter);
app.use("/api/v1", postRouter);

app.get("/", async (req, res) => {
  res.send("Anontalks official server");
});
// app.get("/api/v1", async (req, res) => {
//   users.find().then((data) => {
//     res.status(200).send(data);
//   });
// });

export default app;
