const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Verify a health claim using OpenAI GPT-4
 * Returns verification status, confidence score, trust score, and scientific references
 */
async function verifyHealthClaim(claimText) {
  try {
    console.log("🤖 Starting AI verification for claim:", claimText.substring(0, 100) + "...");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert fact-checker and information analyst. 
Analyze ALL types of claims - health, technology, business, politics, economics, science, etc.
Verify factual accuracy using your knowledge base and provide detailed verification.

Respond ONLY in valid JSON format with this exact structure:
{
  "verdict": "verified" | "questionable" | "debunked",
  "confidenceScore": <number 1-100>,
  "trustScore": <number 1-100>,
  "explanation": "<2-3 sentence explanation of your verdict and reasoning>",
  "scientificReferences": [
    {
      "title": "<source title or headline>",
      "journal": "<source name: news outlet, official site, report, journal, etc.>",
      "url": "<url if known, otherwise empty string>"
    }
  ]
}

Scoring Guidelines:
- confidenceScore: How confident you are in your verdict (1-100, NEVER 0)
- trustScore: How trustworthy/accurate the claim is based on available evidence (1-100, NEVER 0)
  * 85-100: Proven facts, official data, well-documented events
  * 70-84: Highly likely true, strong credible sources
  * 55-69: Likely true, some credible sources, minor uncertainties
  * 40-54: Mixed evidence, contradictory sources, context-dependent
  * 25-39: Likely false, weak evidence, mostly contradicted
  * 1-24: Clearly false, proven misinformation

Verdict Guidelines:
- "verified": Factually accurate, supported by credible evidence/sources (trustScore 70+)
- "questionable": Insufficient evidence, ambiguous, needs context, or partially true (trustScore 40-69)
- "debunked": Proven false, contradicted by facts/evidence (trustScore below 40)

Analysis Guidelines:
1. Economic/Business claims: Verify against official statistics, company reports, market data
2. Technology claims: Check against product specifications, company announcements, tech news
3. Political claims: Verify against official statements, news reports, fact-checking sites
4. Health/Medical claims: Check against medical research, health organizations, studies
5. General news: Cross-reference with multiple credible news sources

CRITICAL RULES:
1. NEVER return scores of 0 - minimum is 1
2. Be objective - analyze the factual accuracy, not the topic
3. Provide sources/references when possible (news articles, official sites, reports)
4. For verifiable facts (statistics, dates, events), give high confidence scores
5. For opinion-based or context-dependent claims, use "questionable" verdict`,
          },
          {
            role: "user",
            content: `Analyze this claim and verify its factual accuracy: "${claimText}"

Determine:
1. Is this claim factually accurate?
2. What evidence supports or contradicts it?
3. What are credible sources for verification?

Provide your assessment in the required JSON format.`,
          },
        ],
        max_tokens: 800,
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const content = response.data.choices[0].message.content.trim();
    console.log("📥 OpenAI raw response:", content);

    // Parse JSON response
    let parsed;
    try {
      // Try to extract JSON if there's extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(content);
      }
      console.log("✅ Parsed response:", JSON.stringify(parsed, null, 2));
    } catch (parseError) {
      console.error("❌ Failed to parse OpenAI response:", content);
      throw new Error("Invalid response format from OpenAI");
    }

    // Validate and normalize the response
    const result = {
      verificationStatus: normalizeVerdict(parsed.verdict),
      confidenceScore: Math.min(100, Math.max(0, Number(parsed.confidenceScore) || 50)),
      trustScore: Math.min(100, Math.max(0, Number(parsed.trustScore) || 50)),
      explanation: parsed.explanation || "AI analysis completed",
      scientificReferences: Array.isArray(parsed.scientificReferences)
        ? parsed.scientificReferences.map((ref) => ({
            title: ref.title || "Reference",
            journal: ref.journal || "Scientific Source",
            url: ref.url || "",
          }))
        : [],
      verifiedAt: new Date(),
    };

    console.log("✅ Final verification result:", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("Error verifying claim with OpenAI:");
    console.error("Error message:", error.message);
    console.error("Error details:", error.response?.data || error);
    
    // Return a safe fallback
    return {
      verificationStatus: "pending",
      confidenceScore: 0,
      trustScore: 0,
      explanation: `Verification failed: ${error.message}`,
      scientificReferences: [],
      verifiedAt: new Date(),
      error: true,
    };
  }
}

/**
 * Normalize verdict to match our database enum
 */
function normalizeVerdict(verdict) {
  if (!verdict) return "questionable";
  
  const normalized = verdict.toLowerCase().trim();
  if (normalized === "verified" || normalized === "true" || normalized === "accurate") {
    return "verified";
  } else if (normalized === "debunked" || normalized === "false" || normalized === "incorrect") {
    return "debunked";
  } else {
    return "questionable";
  }
}

/**
 * Batch verify multiple claims with rate limiting
 */
async function verifyMultipleClaims(claims, delayMs = 1000) {
  const results = [];
  
  for (let i = 0; i < claims.length; i++) {
    console.log(`Verifying claim ${i + 1}/${claims.length}...`);
    
    const result = await verifyHealthClaim(claims[i].content);
    results.push({
      claimId: claims[i]._id,
      ...result,
    });
    
    // Add delay to avoid rate limiting (except for last item)
    if (i < claims.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

/**
 * Generate a comprehensive health topic research report using OpenAI
 * @param {string} topic - The health topic to research (e.g., "keto diet", "CBD oil")
 * @param {Array} selectedJournals - List of scientific journals to reference
 * @returns {Object} - Comprehensive research report
 */
async function generateHealthTopicReport(topic, selectedJournals = []) {
  try {
    console.log(`🔬 Generating research report for topic: "${topic}"`);
    
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    const journalsText = selectedJournals.length > 0 
      ? `Focus on research from these journals: ${selectedJournals.join(", ")}.`
      : "";

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a medical research expert and health information analyst. 
Generate comprehensive, evidence-based research reports on health topics.

Respond ONLY in valid JSON format with this exact structure:
{
  "scientificConsensus": "<3-4 sentence summary of current scientific consensus>",
  "commonClaims": [
    {
      "claim": "<common claim about this topic>",
      "isTrue": true/false,
      "explanation": "<2-3 sentence explanation with evidence>"
    }
  ],
  "riskFactors": ["<risk factor 1>", "<risk factor 2>", ...],
  "considerations": ["<important consideration 1>", "<consideration 2>", ...],
  "relevantJournals": [
    {
      "name": "<journal name>",
      "relevance": "<why this journal is relevant for this topic>"
    }
  ],
  "suggestedInfluencers": [
    {
      "name": "<influencer/expert name>",
      "expertise": "<their area of expertise>",
      "reason": "<why they're credible on this topic>"
    }
  ],
  "summary": "<2-3 paragraph executive summary>",
  "keyTakeaways": ["<key point 1>", "<key point 2>", ...]
}

Guidelines:
1. Provide 5-8 common claims (mix of true and false)
2. List 3-5 risk factors and considerations
3. Suggest 3-5 relevant scientific journals
4. Recommend 3-5 real or realistic health influencers/experts
5. Include 4-6 key takeaways
6. Be evidence-based and objective
7. Focus on current scientific understanding
8. Highlight controversies or debates if they exist`,
          },
          {
            role: "user",
            content: `Generate a comprehensive research report on the health topic: "${topic}"

${journalsText}

Include:
1. Current scientific consensus
2. Common claims people make (both true and false claims)
3. Risk factors and safety considerations
4. Relevant scientific journals for this topic
5. Credible health influencers or experts who discuss this topic
6. Executive summary and key takeaways

Provide your report in the required JSON format.`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.4,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 45000,
      }
    );

    const content = response.data.choices[0].message.content.trim();
    console.log("📥 OpenAI research report generated");

    // Parse JSON response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Failed to parse OpenAI response as JSON");
      }
    }

    // Validate required fields
    if (!parsed.scientificConsensus || !parsed.commonClaims || !parsed.summary) {
      throw new Error("Invalid report structure from OpenAI");
    }

    console.log("✅ Research report parsed successfully");
    console.log(`   - ${parsed.commonClaims.length} common claims analyzed`);
    console.log(`   - ${parsed.suggestedInfluencers?.length || 0} influencers suggested`);

    return {
      success: true,
      report: parsed,
    };
  } catch (error) {
    console.error("❌ Error generating research report:", error.message);
    
    if (error.response) {
      console.error("   OpenAI API error:", error.response.data);
    }

    return {
      success: false,
      error: error.message,
      report: null,
    };
  }
}

module.exports = {
  verifyHealthClaim,
  verifyMultipleClaims,
  generateHealthTopicReport,
};
