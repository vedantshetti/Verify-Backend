const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const cookieParser = require('cookie-parser');
require('./config/passport');
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');
require("./cron");


const app = express();
connectDB();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/influencers', require('./modules/influencers/influencers.routes'));
app.use('/api/claims', require('./modules/claims/claims.routes'));
app.use('/api/analytics', require('./modules/analytics/analytics.routes'));
app.use('/api/research', require('./modules/research/research.routes'));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'verify-backend', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

module.exports = app;
