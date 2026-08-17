import pool from '../config/db.js';

export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users ORDER BY user_id DESC');
    res.json(rows);
  } catch (err) {
    console.error('GET USERS ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
