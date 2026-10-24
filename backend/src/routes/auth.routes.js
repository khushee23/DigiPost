import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public Authentication endpoints
router.post("/register", register);
router.post("/login", login);

// Protected User Profile & Authorization endpoints
router.get("/me", protectRoute, getMe);
router.put("/profile", protectRoute, updateProfile);
router.put("/change-password", protectRoute, changePassword);

// Optional logout endpoint to clear cookie
router.post("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export default router;
