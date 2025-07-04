const Claim = require("./claims.model");
const Influencer = require("../influencers/influencers.model");

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
    // Optionally update influencer's verifiedClaims and trustScore here
    const claim = await Claim.create(data);
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
    return claim.populate("influencer");
  }
}

module.exports = new ClaimsService();
