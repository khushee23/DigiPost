import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Import route modules
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.route.js';
import parcelRoutes from './routes/parcel.route.js';
import deliveryRoutes from './routes/delivery.route.js';
import adminRoutes from './routes/admin.routes.js';
import complaintsRoutes from './routes/complaints.route.js';
import notificationsRoutes from './routes/notifications.route.js';
import analyticsRoutes from './routes/analytics.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', parcelRoutes);
app.use('/api', deliveryRoutes);
app.use('/api', adminRoutes);
app.use('/api', complaintsRoutes);
app.use('/api', notificationsRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', feedbackRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DigiPost - Post Office Automation API is running',
    version: '1.0.0',
  });
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

export default app;