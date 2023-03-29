
import express from "express";
import { register, login, followUser } from "../../anontalks backend/controllers/user.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/follow/:id", isAuthenticated, followUser);

export default router;