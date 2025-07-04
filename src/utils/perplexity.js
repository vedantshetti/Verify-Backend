// src/utils/perplexity.js
const axios = require("axios");

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

async function verifyClaimWithPerplexity(claimText) {
  const response = await axios.post(
    "https://api.perplexity.ai/v1/verify-claim",
    { claim: claimText },
    { headers: { Authorization: `Bearer ${PERPLEXITY_API_KEY}` } }
  );
  // Adjust parsing as per Perplexity's API response
  return {
    status: response.data.status,
    confidence: response.data.confidence,
    references: response.data.references,
  };
}

module.exports = { verifyClaimWithPerplexity };
