import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import orderRoutes from './routes/orderRoutes.js';
import asnRoutes from './routes/asnRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

// --- API Routes ---
app.use('/api', orderRoutes);
app.use('/api', asnRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));