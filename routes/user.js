
import express from "express";
import { register,
     login,
      followUser,
       logout,
        updatePassword,
         updateProfile,
          deleteMyProfile,
           myProfile,
            getUserProfile,
             getAllUsers,
              forgotPassword,
               resetPassword,
               getMyPosts
} from "../../anontalks backend/controllers/user.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/logout", logout);

router.get("/follow/:id", isAuthenticated, followUser);

router.put("/update/password", isAuthenticated, updatePassword);

router.put("/update/profile", isAuthenticated, updateProfile);

router.delete("/profile/delete/me", isAuthenticated, deleteMyProfile);

router.get("/me", isAuthenticated, myProfile);
router.get("/my/posts", isAuthenticated, getMyPosts);

router.get("/:id", isAuthenticated, getUserProfile );

router.get("/users/all", isAuthenticated, getAllUsers );

router.post("/forgot/password", forgotPassword);

router.put("/password/reset/:token", resetPassword);

export default router;