import express from 'express';
import {
  register,
  login,
  forgotPassword,
  verifyOtp,resetPassword,
  getProfile,
  updateProfile
} from "../controllers/auth.controller.js";

const router = express.Router();
router.get("/test", (req, res) => {
  res.send("Auth Route Working");
});
router.post('/register', register);
router.post('/login', login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.get("/profile/:id", getProfile);

router.put("/profile/:id", updateProfile);
export default router;
