const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const config = require('./config');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRoutes);

mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = config.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
