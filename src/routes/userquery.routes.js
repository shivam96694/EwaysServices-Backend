import express from "express";
import { addUserQuery, getAllQueries } from "../controllers/userquery.controller.js";

const router = express.Router();

// POST: Add a new query
router.post("/query", addUserQuery);

// GET: Optional - fetch all user queries
router.get("/test", (req, res) => res.send("✅ userquery route working"));

export default router;
