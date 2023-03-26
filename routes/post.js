import express from "express";
import { createPost } from "../controllers/post";

export const router = express.Router();

router.route("/post/create").post(createPost);