const mongoose = require("mongoose");

const researchTaskSchema = new mongoose.Schema(
  {
    claim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      required: true,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["open", "in-progress", "completed"],
      default: "open",
    },
    notes: String,
  },
  { timestamps: true }
);

const evidenceSchema = new mongoose.Schema(
  {
    claim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      required: true,
    },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    journal: String,
    title: String,
    url: String,
    summary: String,
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const researchReportSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    
    // Configuration
    timeRange: String,
    includeRevenue: Boolean,
    verifyJournals: Boolean,
    selectedJournals: [String],
    productsPerInfluencer: Number,
    
    // AI-Generated Report Content
    scientificConsensus: String,
    commonClaims: [{
      claim: String,
      isTrue: Boolean,
      explanation: String,
    }],
    riskFactors: [String],
    considerations: [String],
    relevantJournals: [{
      name: String,
      relevance: String,
    }],
    suggestedInfluencers: [{
      name: String,
      expertise: String,
      reason: String,
    }],
    
    // Summary
    summary: String,
    keyTakeaways: [String],
  },
  { timestamps: true }
);

module.exports = {
  ResearchTask: mongoose.model("ResearchTask", researchTaskSchema),
  Evidence: mongoose.model("Evidence", evidenceSchema),
  ResearchReport: mongoose.model("ResearchReport", researchReportSchema),
};
