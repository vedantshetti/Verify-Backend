const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Set your OpenAI key in .env

async function verifyClaimWithOpenAI(claimText) {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o", // Or "gpt-3.5-turbo" if you prefer
      messages: [
        {
          role: "system",
          content:
            'You are a scientific fact-checking assistant. Respond ONLY in this exact JSON format: { "verdict": "Verified|Debunked|Questionable", "confidenceScore": number (0-100), "trustScore": number (0-100), "scientificReferences": [{ "journal": string, "title": string, "url": string }] }. i need these information any how speciolly scores . Do not add any explanation or extra text. \'confidenceScore\': 0  \'trustScore\': 0, dont send me zero send me some thing',
        },
        {
          role: "user",
          content: `Is this claim true? "${claimText}"`,
        },
      ],
      max_tokens: 500,
      temperature: 0.2,
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const content = response.data.choices[0].message.content;

  // Try to parse as JSON
  let status = "questionable";
  let confidence = 50; // Default to 50 if not provided
  let trust = 50;
  let references = [];
  try {
    const parsed = JSON.parse(content);
    status = parsed.verdict?.toLowerCase() || "questionable";
    confidence =
      parsed.confidenceScore !== undefined
        ? Number(parsed.confidenceScore)
        : 50;
    trust =
      parsed.trustScore !== undefined ? Number(parsed.trustScore) : confidence;
    references = Array.isArray(parsed.scientificReferences)
      ? parsed.scientificReferences
      : [];
    confidence = Math.max(0, Math.min(100, confidence));
    trust = Math.max(0, Math.min(100, trust));
  } catch (e) {
    // Fallback: extract with regex for legacy/free-text outputs
    const statusMatch = content.match(/(Verified|Debunked|Questionable)/i);
    status = statusMatch ? statusMatch[1].toLowerCase().trim() : "questionable";
    const confidenceMatch = content.match(
      /confidence\s*(score)?\s*[:=]?\s*(\d{1,3})/i
    );
    if (confidenceMatch && confidenceMatch[2]) {
      confidence = parseInt(confidenceMatch[2]);
      if (isNaN(confidence) || confidence < 0 || confidence > 100)
        confidence = 50;
    }
    const trustMatch = content.match(/trust\s*score\s*[:=]?\s*(\d{1,3})/i);
    if (trustMatch && trustMatch[1]) {
      trust = parseInt(trustMatch[1]);
      if (isNaN(trust) || trust < 0 || trust > 100) trust = confidence;
    } else {
      trust = confidence;
    }
    const referencesMatch = content.match(/References?:\s*([\s\S]*)/i);
    if (referencesMatch && referencesMatch[1]) {
      const urlRegex = /(https?:\/\/[^\s\]\)]+)/g;
      const urls = referencesMatch[1].match(urlRegex);
      if (urls && urls.length > 0) {
        references = urls.map((url) => ({
          journal: "",
          title: "",
          url: url.trim(),
        }));
      } else {
        references = [
          {
            journal: "",
            title: referencesMatch[1].trim(),
            url: "",
          },
        ];
      }
    }
  }
  return {
    status,
    confidenceScore: confidence,
    trustScore: trust,
    scientificReferences: references,
  };
};

module.exports = { verifyClaimWithOpenAI };

