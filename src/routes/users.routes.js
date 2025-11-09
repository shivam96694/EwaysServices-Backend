import express from 'express';
import { getUsers, addUser, checkUserExists,loginUser  } from '../controllers/useri.controller.js';

const router = express.Router();

// GET /users
router.get('/', getUsers);

// POST /users/add  (create a new user)
router.post('/add', addUser);

// POST /users/check (optional) - check if email/mobile exists
router.post('/check', checkUserExists);

router.post("/login", loginUser);

export default router;
