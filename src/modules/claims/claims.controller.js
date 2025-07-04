const service = require("./claims.service");
const { verifyClaimWithOpenAI } = require("../../utils/perplexity"); 

// List all claims
exports.list = async (req, res) => {
  const claims = await service.list(req.query);
  res.json({ success: true, data: claims });
};

// Get a claim by ID
exports.getById = async (req, res) => {
  const claim = await service.getById(req.params.id);
  if (!claim)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data: claim });
};

// Create a new claim
exports.create = async (req, res) => {
  const claim = await service.create(req.body);
  res.status(201).json({ success: true, data: claim });
};

// Update a claim by ID
exports.update = async (req, res) => {
  const claim = await service.update(req.params.id, req.body);
  if (!claim)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data: claim });
};

// Manually verify a claim with supplied scores
exports.verifyClaim = async (req, res) => {
  const {
    verificationStatus,
    confidenceScore,
    trustScore,
    scientificReferences,
  } = req.body;
  const claim = await service.verifyClaim(
    req.params.id,
    verificationStatus,
    confidenceScore,
    trustScore,
    scientificReferences
  );
  res.json({ success: true, data: claim });
};

// Create or fetch an existing claim by postId
exports.getOrVerifyClaim = async (req, res) => {
  const {
    postId,
    influencerId,
    content,
    category,
    datePublished,
    sourceLinks,
  } = req.body;
  if (!postId || !influencerId || !content || !datePublished) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }
  try {
    const claim = await service.getOrVerifyClaim({
      postId,
      influencerId,
      content,
      category,
      datePublished,
      sourceLinks,
    });
    res.json({ success: true, data: claim });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// On-demand claim verification via OpenAI
exports.verifyOnDemand = async (req, res) => {
  try {
    const claimId = req.params.id;
    const claim = await service.getById(claimId);
    if (!claim)
      return res.status(404).json({ success: false, message: "Claim not found" });

    const result = await service.verifyWithOpenAI(claim);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("verifyOnDemand error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
