import pool from '../config/db.js';
import bcrypt from 'bcrypt';

// Fetch all users
export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, username, useremail, usermobileno, is_verified, created_at FROM users ORDER BY user_id DESC'
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error('USER FETCH ERROR:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Optional: check if email or mobile exists
export const checkUserExists = async (req, res) => {
  try {
    const { useremail, usermobileno } = req.body;
    if (!useremail && !usermobileno) {
      return res.status(400).json({ success: false, error: 'Provide email or mobile' });
    }

    const [rows] = await pool.query(
      'SELECT user_id, username, useremail, usermobileno FROM users WHERE useremail = ? OR usermobileno = ? LIMIT 1',
      [useremail || null, usermobileno || null]
    );

    if (rows.length > 0) {
      return res.json({ success: true, exists: true, user: rows[0] });
    } else {
      return res.json({ success: true, exists: false });
    }
  } catch (error) {
    console.error('CHECK USER ERROR:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Add new user (signup) — allows password optional (for OTP flows)
export const addUser = async (req, res) => {
  try {
    const { username, useremail, usermobileno, password } = req.body;

    if (!username || (!useremail && !usermobileno)) {
      return res.status(400).json({ success: false, error: 'Name and (email or mobile) required' });
    }

    // Check duplicates
    const [exists] = await pool.query(
      'SELECT user_id FROM users WHERE useremail = ? OR usermobileno = ? LIMIT 1',
      [useremail || null, usermobileno || null]
    );
    if (exists.length > 0) {
      return res.status(409).json({ success: false, error: 'Email or mobile already registered' });
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const [result] = await pool.query(
      'INSERT INTO users (username, useremail, usermobileno, password, is_verified) VALUES (?, ?, ?, ?, ?)',
      [username, useremail || null, usermobileno || null, hashedPassword, 1] // set is_verified=1 if OTP verified by flow
    );

    return res.json({ success: true, message: 'User added successfully', user_id: result.insertId });
  } catch (error) {
    console.error('USER ADD ERROR:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};




// ✅ LOGIN Controller
export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email/Mobile and password are required" });
    }

    // ✅ Find user by email or mobile
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE useremail = ? OR usermobileno = ? LIMIT 1",
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "User not found. Please sign up first." });
    }

    const user = rows[0];

    // ✅ Compare password with bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid password. Please try again." });
    }

    // ✅ Return success
    res.json({
      success: true,
      message: "Login successful",
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.useremail,
        mobile: user.usermobileno,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
