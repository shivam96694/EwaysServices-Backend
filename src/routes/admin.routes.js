import express from 'express';
import upload from '../middleware/multer.js';
import pool from '../config/db.js';

const router = express.Router();

router.post('/add-service', upload.single('service_image'), async (req, res) => {
  try {
    const { service_name, service_description, service_price } = req.body;
    const service_image = req.file ? req.file.filename : null;

    const [result] = await pool.query(
      'INSERT INTO services (service_name, service_description, service_price, service_image) VALUES (?, ?, ?, ?)',
      [service_name, service_description, service_price, service_image]
    );

    res.json({ message: 'Service added successfully', id: result.insertId });
  } catch (err) {
    console.error('ADMIN ADD SERVICE ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
