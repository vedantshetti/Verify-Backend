const Claim = require("./claims.model");
const Influencer = require("../influencers/influencers.model");
const { verifyClaimWithOpenAI } = require("../../utils/perplexity"); // Utility for Perplexity API

class ClaimsService {
  async list(query) {
    const filter = {};
    if (query.influencerId) filter.influencer = query.influencerId;
    if (query.category) filter.category = query.category;
    if (query.verificationStatus)
      filter.verificationStatus = query.verificationStatus;
    if (query.startDate || query.endDate) {
      filter.datePublished = {};
      if (query.startDate)
        filter.datePublished.$gte = new Date(query.startDate);
      if (query.endDate) filter.datePublished.$lte = new Date(query.endDate);
    }
    return Claim.find(filter).populate("influencer");
  }

  async getById(id) {
    return Claim.findById(id).populate("influencer");
  }

  async create(data) {
    // 1. Create the claim in the DB
    const claim = await Claim.create(data);

    // 2. Automatically verify with Perplexity
    try {
      const result = await verifyClaimWithOpenAI(claim.content);

      // 3. Update claim with verification results
      claim.verificationStatus = result.status;
      claim.confidenceScore = result.confidenceScore;
      claim.trustScore = result.trustScore;
      claim.scientificReferences = result.scientificReferences;
      await claim.save();

      // 4. Optionally, update influencer's verifiedClaims and trustScore
      if (claim.verificationStatus === "verified") {
        const influencer = await Influencer.findById(claim.influencer);
        if (influencer) {
          influencer.verifiedClaims = (influencer.verifiedClaims || 0) + 1;
          // Recalculate average trustScore
          const claims = await Claim.find({
            influencer: influencer._id,
            verificationStatus: "verified",
          });
          const avgTrust = claims.length
            ? claims.reduce((sum, c) => sum + (c.trustScore || 0), 0) /
              claims.length
            : 0;
          influencer.trustScore = Math.round(avgTrust);
          await influencer.save();
        }
      }
    } catch (err) {
      // If Perplexity fails, mark as "questionable" and log error
      claim.verificationStatus = "questionable";
      claim.confidenceScore = 0;
      claim.trustScore = 0;
      claim.scientificReferences = [];
      await claim.save();
      // Optionally log error: console.error("Perplexity verification failed:", err);
    }

    return claim.populate("influencer");
  }

  async update(id, data) {
    const claim = await Claim.findByIdAndUpdate(id, data, {
      new: true,
    }).populate("influencer");
    return claim;
  }

  async verifyClaim(
    id,
    verificationStatus,
    confidenceScore,
    trustScore,
    scientificReferences = []
  ) {
    const claim = await Claim.findById(id);
    if (!claim) throw new Error("Claim not found");
    claim.verificationStatus = verificationStatus;
    claim.confidenceScore = confidenceScore;
    claim.trustScore = trustScore;
    claim.scientificReferences = scientificReferences;
    await claim.save();

    // Optionally update influencer's trustScore and verifiedClaims
    if (verificationStatus === "verified") {
      const influencer = await Influencer.findById(claim.influencer);
      if (influencer) {
        influencer.verifiedClaims = (influencer.verifiedClaims || 0) + 1;
        const claims = await Claim.find({
          influencer: influencer._id,
          verificationStatus: "verified",
        });
        const avgTrust = claims.length
          ? claims.reduce((sum, c) => sum + (c.trustScore || 0), 0) /
            claims.length
          : 0;
        influencer.trustScore = Math.round(avgTrust);
        await influencer.save();
      }
    }

    return claim.populate("influencer");
  }

  async getOrVerifyClaim({
    postId,
    influencerId,
    content,
    category,
    datePublished,
    sourceLinks,
  }) {
    let claim = await Claim.findOne({ postId });
    if (claim) return claim;

    // Not in DB: verify with Perplexity
    const result = await verifyClaimWithOpenAI(content);

    claim = await Claim.create({
      postId,
      influencer: influencerId,
      content,
      category,
      datePublished,
      sourceLinks,
      verificationStatus: result.status,
      confidenceScore: result.confidenceScore,
      trustScore: result.trustScore,
      scientificReferences: result.scientificReferences,
    });

    // Optionally update influencer's trust score/verifiedClaims here

    return claim;
  }

  async verifyWithOpenAI(claim) {
    const result = await verifyClaimWithOpenAI(claim.content);

    claim.verificationStatus = result.status;
    claim.confidenceScore = result.confidenceScore;
    claim.trustScore = result.trustScore;
    claim.scientificReferences = result.scientificReferences;

    await claim.save();
    return claim.populate("influencer");
  }
}

module.exports = new ClaimsService();
