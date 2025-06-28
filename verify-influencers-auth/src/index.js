// index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./src/config/database');
const passport = require('./src/config/passport');
const authRoutes = require('./src/routes/auth.routes');
const logger = require('./src/utils/logger');
const { errorResponse } = require('./src/utils/response');

const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [process.env.CLIENT_URL, process.env.API_GATEWAY_URL],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'verify-influencers-auth',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  errorResponse(res, 'Route not found', 404);
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  errorResponse(res, 'Internal server error', 500);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`Auth service running on port ${PORT}`);
});

module.exports = app;
