const mongoose = require("mongoose");

const influencerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    handle: { type: String, required: true, unique: true }, // Twitter username
    bio: String,
    category: String,
    image: String,
    followers: Number,
    trustScore: { type: Number, default: 0 },
    verifiedClaims: { type: Number, default: 0 },
    trend: { type: String, enum: ["up", "down", "steady"], default: "steady" },
    socialLinks: {
      twitter: String,
      instagram: String,
      youtube: String,
      website: String,
    },
    posts: [
      {
        id: String,
        text: String,
        createdAt: Date,
        metrics: {
          retweets: Number,
          likes: Number,
          replies: Number,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Influencer", influencerSchema);
