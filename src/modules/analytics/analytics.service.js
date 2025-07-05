const Influencer = require("../influencers/influencers.model");
const Claim = require("../claims/claims.model");

class AnalyticsService {
  async getLeaderboard({ category, sortBy = "trustScore", limit = 20 }) {
    const filter = {};
    if (category && category !== "all") filter.category = category;
    return Influencer.find(filter)
      .sort({ [sortBy]: -1 })
      .limit(limit)
      .select(
        "name handle category image followers trustScore verifiedClaims trend"
      );
  }

  async getTrends({ influencerId, days = 30 }) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const claims = await Claim.find({
      influencer: influencerId,
      datePublished: { $gte: since },
    }).sort({ datePublished: 1 });
    return claims.map((c) => ({
      date: c.datePublished,
      trustScore: c.trustScore,
      confidenceScore: c.confidenceScore,
      status: c.verificationStatus,
    }));
  }

  async getCategoryStats() {
    const pipeline = [
      {
        $group: {
          _id: "$category",
          total: { $sum: 1 },
          verified: {
            $sum: {
              $cond: [{ $eq: ["$verificationStatus", "verified"] }, 1, 0],
            },
          },
          debunked: {
            $sum: {
              $cond: [{ $eq: ["$verificationStatus", "debunked"] }, 1, 0],
            },
          },
          questionable: {
            $sum: {
              $cond: [{ $eq: ["$verificationStatus", "questionable"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { total: -1 } },
    ];
    return Claim.aggregate(pipeline);
  }

  async getSummary() {
    const totalInfluencers = await Influencer.countDocuments();
    const totalClaims = await Claim.countDocuments();
    const verifiedClaims = await Claim.countDocuments({
      verificationStatus: "verified",
    });
    const avgTrustScore = await Influencer.aggregate([
      { $group: { _id: null, avg: { $avg: "$trustScore" } } },
    ]);
    return {
      totalInfluencers,
      totalClaims,
      verifiedClaims,
      averageTrustScore: avgTrustScore[0]?.avg?.toFixed(1) || 0,
    };
  }

  async getInfluencerAnalytics(influencerId) {
    const influencer = await Influencer.findById(influencerId);
    const claims = await Claim.find({ influencer: influencerId });
    const verified = claims.filter(
      (c) => c.verificationStatus === "verified"
    ).length;
    const debunked = claims.filter(
      (c) => c.verificationStatus === "debunked"
    ).length;
    const questionable = claims.filter(
      (c) => c.verificationStatus === "questionable"
    ).length;
    return {
      influencer,
      totalClaims: claims.length,
      verified,
      debunked,
      questionable,
      averageTrustScore: claims.length
        ? (
            claims.reduce((sum, c) => sum + (c.trustScore || 0), 0) /
            claims.length
          ).toFixed(1)
        : 0,
    };
  }
}

module.exports = new AnalyticsService();
