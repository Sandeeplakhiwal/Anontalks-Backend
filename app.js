import express from "express";
import { config } from "dotenv";
import Cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

config({
  path: "./config/.env",
});

// USING MIDDLEWARES
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(
  Cors({
    origin: "https://instagramsocialmedia.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// IMPORTING ROUTES
import userRoutes from "./routes/user.js";
import postRoutes from "./routes/post.js";

// USING ROUTES
app.use("/api/v1", userRoutes);
app.use("/api/v1", postRoutes);

app.get("/", async (req, res) => {
  res.send("Anontalks official server");
});

export default app;
