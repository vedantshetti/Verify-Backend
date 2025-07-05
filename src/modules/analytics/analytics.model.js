// Optional: For storing precomputed analytics or custom reports
const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'leaderboard', 'trend'
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  generatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Analytics", analyticsSchema);
