import express from "express";
import { addContactMessage, getAllMessages } from "../controllers/contact.controller.js";

const router = express.Router();

// ✅ POST - Add contact message
router.post("/add", addContactMessage);

// ✅ GET - Get all messages (for admin)
router.get("/getall", getAllMessages);

export default router;
