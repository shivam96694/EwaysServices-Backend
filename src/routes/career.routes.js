import express from "express";
import { addCareerApplication, upload } from "../controllers/career.controller.js";

const router = express.Router();

// POST route for career applications
router.post("/add", upload.single("resume"), addCareerApplication);

export default router;
