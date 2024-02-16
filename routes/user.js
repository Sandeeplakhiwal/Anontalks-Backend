import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  UpdateProfileAvatar,
  deleteMyProfile,
  followSuggestions,
  followUser,
  forgotPassword,
  getAllUsers,
  getMyPosts,
  getUserFollowers,
  getUserFollowings,
  getUserNameById,
  getUserProfile,
  login,
  logout,
  myProfile,
  popularSuggestions,
  register,
  resetPassword,
  searchUserProfile,
  updatePassword,
  updateProfile,
} from "../controllers/user.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/logout", isAuthenticated, logout);

router.get("/follow/:id", isAuthenticated, followUser);

router.get("/suggestions/follow", isAuthenticated, followSuggestions);

router.get("/suggestions/popular/follow", isAuthenticated, popularSuggestions);

router.put("/update/password", isAuthenticated, updatePassword);

router.put("/update/profile", isAuthenticated, updateProfile);

router.put("/update/profile/avatar", isAuthenticated, UpdateProfileAvatar);

router.delete("/profile/delete/me", isAuthenticated, deleteMyProfile);

router.get("/me", isAuthenticated, myProfile);
router.get("/my/posts", isAuthenticated, getMyPosts);

router.get("/:id", isAuthenticated, getUserProfile);

router.get("/user/followings/:id", isAuthenticated, getUserFollowings);

router.get("/user/followers/:id", isAuthenticated, getUserFollowers);

router.get("/users/all", isAuthenticated, getAllUsers);

router.post("/forgot/password", forgotPassword);

router.put("/password/reset/:token", resetPassword);

router.get("/profile/search", isAuthenticated, searchUserProfile);

router.get("/username/:id", getUserNameById);

export default router;
