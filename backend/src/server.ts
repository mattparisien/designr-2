import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';

import assetRoutes from './routes/assets';
import authRoutes from './routes/auth';
import brandRoutes from './routes/brands';
import chatRoutes from "./routes/chat";
import compositionRoutes from './routes/compositions';
import exportRoutes from './routes/export';
import fontRoutes from './routes/fonts';
import projectRoutes from './routes/projects';
import stripeRoutes from './routes/stripe';
import telemetryRoutes from './routes/telemetry';
import templateRoutes from './routes/template';

// Load environment variables
dotenv.config();


const app = express();
const PORT = process.env.PORT || 5001; // Changed to 5001 to match frontend expectations

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));


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
app.use('/api/export', exportRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/chat', chatRoutes);
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

export default app;
