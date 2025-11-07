import pool from '../config/db.js';

export const getServices = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM services ORDER BY service_id DESC');
    res.json(rows);
  } catch (err) {
    console.error('SERVICE FETCH ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
