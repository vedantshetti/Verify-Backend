const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    postId: { type: String, required: true, unique: true }, // Twitter post ID
    influencer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Influencer",
      required: true,
    },
    content: { type: String, required: true },
    category: { type: String },
    verificationStatus: {
      type: String,
      enum: ["verified", "questionable", "debunked"],
      default: "questionable",
    },
    confidenceScore: { type: Number, min: 0, max: 100, default: 0 },
    trustScore: { type: Number, min: 0, max: 100, default: 0 },
    scientificReferences: [
      {
        journal: String,
        title: String,
        url: String,
      },
    ],
    sourceLinks: [String],
    datePublished: { type: Date, required: true },
    notes: String,
  },
  { timestamps: true }
);

claimSchema.index({ postId: 1 }, { unique: true });

module.exports = mongoose.model("Claim", claimSchema);
