import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";
import {
  commentOnPost,
  createPost,
  deleteComment,
  deletePost,
  getPostComments,
  getPostLikes,
  getPostOfFollowing,
  likeAndUnlikePost,
  updateCaption,
} from "../controllers/post.js";

const router = express.Router();

router.post("/post/upload", isAuthenticated, createPost);
router.put("/post/update/:id", isAuthenticated, updateCaption);
router.get("/post/:id", isAuthenticated, likeAndUnlikePost);
router.delete("/post/:id", isAuthenticated, deletePost);
router.get("/following/posts", isAuthenticated, getPostOfFollowing);
router.put("/post/comment/:id", isAuthenticated, commentOnPost);
router.delete("/post/comment/:id", isAuthenticated, deleteComment);
router.get("/post/comments/:id", isAuthenticated, getPostComments);
router.get("/post/likes/:id", isAuthenticated, getPostLikes);

export default router;
