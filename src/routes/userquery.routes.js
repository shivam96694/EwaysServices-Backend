import express from "express";

import {
  addUserQuery,
  getAllQueries,
   sendOtp,
  verifyOtp,
} from "../controllers/userquery.controller.js";

const router = express.Router();

// Contact form rate limiter


// POST: Add a new query
router.post("/query", addUserQuery);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
// GET: Test route
router.get("/test", (req, res) =>
  res.send("✅ userquery route working")
);

export default router;