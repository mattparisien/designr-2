import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth';
import brandRoutes from './routes/brands';
import templateRoutes from './routes/templates';
import projectRoutes from './routes/projects';
import compositionRoutes from './routes/compositions';
import aiRoutes from './routes/ai';
import exportRoutes from './routes/export';
import stripeRoutes from './routes/stripe';
import telemetryRoutes from './routes/telemetry';
import fontRoutes from './routes/fonts';
import assetRoutes from './routes/assets';

// Load environment variables
dotenv.config();

console.log('Server startup - Environment check:');
console.log('Current working directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY present:', !!process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET present:', !!process.env.CLOUDINARY_API_SECRET);
console.log('OPENAI_API_KEY value (first 10 chars):', process.env.OPENAI_API_KEY?.substring(0, 10));

const app = express();
const PORT = process.env.PORT || 5001; // Changed to 5001 to match frontend expectations

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting removed for editor functionality
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/design-tool')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/compositions', compositionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/fonts', fontRoutes);
app.use('/api/assets', assetRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
