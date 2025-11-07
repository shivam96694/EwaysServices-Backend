// ===== Imports =====
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ===== Config =====
dotenv.config();

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== Initialize App =====
const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== Static Files =====
// Serve uploaded images (via multer uploads folder)
app.use('/uploads', express.static(path.join(__dirname, 'public/images')));

// ===== Routes (ESM Imports) =====
import usersRoutes from './routes/users.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import serviceRoutes from './routes/service.routes.js';

// ===== Health Check =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'running', time: new Date() });
});

// ===== Mount Routes =====
app.use('/api/users', usersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);

// ===== Root Test Route =====
app.get('/', (req, res) => {
  res.send('Backend running ✅');
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
