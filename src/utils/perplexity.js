// src/utils/perplexity.js
const axios = require("axios");

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

async function verifyClaimWithPerplexity(claimText) {
  const response = await axios.post(
    "https://api.perplexity.ai/v1/verify-claim",
    { claim: claimText },
    { headers: { Authorization: `Bearer ${PERPLEXITY_API_KEY}` } }
  );
  // Adjust the response parsing based on Perplexity's API docs
  return {
    status: response.data.status, // e.g., "verified", "debunked", "questionable"
    confidence: response.data.confidence, // e.g., 0-100
    references: response.data.references, // array of { journal, title, url }
  };
}

module.exports = { verifyClaimWithPerplexity };
