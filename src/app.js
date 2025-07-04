const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/database");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
connectDB();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Mount module routes
app.use("/api/auth", require("./modules/auth/auth.routes"));
// Add other modules here as you implement them

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "verify-backend",
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
