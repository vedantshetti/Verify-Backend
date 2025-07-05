const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
require('./config/passport');
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
connectDB();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/influencers', require('./modules/influencers/influencers.routes'));
app.use('/api/claims', require('./modules/claims/claims.routes'));
app.use('/api/analytics', require('./modules/analytics/analytics.routes'));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'verify-backend', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

module.exports = app;
