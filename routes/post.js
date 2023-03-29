import express from "express";
import { createPost, deletePost, getPostOfFollowing, likeAndUnlikePost } from "../../anontalks backend/controllers/post.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/post/upload", isAuthenticated, createPost);
router.get("/post/:id", isAuthenticated, likeAndUnlikePost);
router.delete("/post/:id", isAuthenticated, deletePost);
router.get("/posts", isAuthenticated, getPostOfFollowing);

export default router;