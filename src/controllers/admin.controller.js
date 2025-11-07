import pool from '../config/db.js';

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM userlogin');
    res.json(rows);
  } catch (err) {
    console.error('ADMIN FETCH USERS ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
