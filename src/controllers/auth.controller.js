import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { username, usermobileno, useremail, password } = req.body;

    if (!username || !usermobileno || !useremail || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO userlogin (username, usermobileno, useremail, password) VALUES (?, ?, ?, ?)',
      [username, usermobileno, useremail, hashedPassword]
    );

    const token = jwt.sign(
      { userid: result.insertId, useremail },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '1d' }
    );

    res.json({ message: 'Registered', userid: result.insertId, token });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { useremail, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM userlogin WHERE useremail = ?', [useremail]);

    if (rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { userid: user.userid, useremail },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '1d' }
    );

    res.json({ message: 'Login successful', token, username: user.username });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
