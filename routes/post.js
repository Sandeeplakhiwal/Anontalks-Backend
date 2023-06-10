import express from "express";
import {
  commentOnPost,
  createPost,
  deleteComment,
  deletePost,
  getPostOfFollowing,
  likeAndUnlikePost,
  updateCaption,
} from "../../anontalks backend/controllers/post.js";
import { isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router.post("/post/upload", isAuthenticated, singleUpload, createPost);
router.put("/post/update/:id", isAuthenticated, updateCaption);
router.get("/post/:id", isAuthenticated, likeAndUnlikePost);
router.delete("/post/:id", isAuthenticated, deletePost);
router.get("/following/posts", isAuthenticated, getPostOfFollowing);
router.put("/post/comment/:id", isAuthenticated, commentOnPost);
router.delete("/post/comment/:id", isAuthenticated, deleteComment);

export default router;
