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

module.exports = {
  ResearchTask: mongoose.model("ResearchTask", researchTaskSchema),
  Evidence: mongoose.model("Evidence", evidenceSchema),
};
