const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    influencer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Influencer",
      required: true,
    },
    content: { type: String, required: true }, // The claim text
    category: { type: String, required: true }, // e.g., "nutrition", "medicine"
    verificationStatus: {
      type: String,
      enum: ["verified", "questionable", "debunked"],
      default: "questionable",
    },
    confidenceScore: { type: Number, min: 0, max: 100, default: 0 }, // 0-100
    trustScore: { type: Number, min: 0, max: 100, default: 0 }, // 0-100, for this claim
    scientificReferences: [
      {
        journal: String,
        title: String,
        url: String,
      },
    ],
    sourceLinks: [String], // URLs to original tweet/post or other sources
    datePublished: { type: Date, required: true },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Claim", claimSchema);
