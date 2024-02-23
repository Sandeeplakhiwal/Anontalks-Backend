import express from "express";
import {
  backupMessages,
  getUserBackedupMessages,
} from "../controllers/message.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/backup-messages", backupMessages);

router.get("/backup/messages", isAuthenticated, getUserBackedupMessages);

export default router;
