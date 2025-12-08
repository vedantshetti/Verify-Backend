const Influencer = require("../influencers/influencers.model");
const Claim = require("../claims/claims.model");

class AnalyticsService {
  async getLeaderboard({ category, sortBy = "trustScore", order = "desc", limit = 20 }) {
    const filter = {};
    if (category && category !== "all") filter.category = category;
    const sortOrder = order === "asc" ? 1 : -1;
    return Influencer.find(filter)
      .sort({ [sortBy]: sortOrder })
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
    const results = await Claim.aggregate(pipeline);
    // Return array of unique category names for the filter dropdown
    return results.map(r => r._id).filter(cat => cat); // filter out null/undefined
  }

  async getSummary() {
    const totalInfluencers = await Influencer.countDocuments();
    const totalClaims = await Claim.countDocuments();
    
    // Count claims by verification status
    const verifiedClaims = await Claim.countDocuments({
      verificationStatus: "verified",
    });
    const pendingClaims = await Claim.countDocuments({
      verificationStatus: "pending",
    });
    const questionableClaims = await Claim.countDocuments({
      verificationStatus: "questionable",
    });
    const debunkedClaims = await Claim.countDocuments({
      verificationStatus: "debunked",
    });
    
    // Calculate average trust score
    const avgTrustScore = await Influencer.aggregate([
      { $group: { _id: null, avg: { $avg: "$trustScore" } } },
    ]);
    
    return {
      // Main dashboard stats
      activeInfluencers: totalInfluencers, // Total influencers in database
      claimsVerified: verifiedClaims, // Claims that have been verified
      averageTrustScore: avgTrustScore[0]?.avg?.toFixed(1) || "0.0",
      
      // Additional detailed stats
      totalInfluencers,
      totalClaims,
      verifiedClaims,
      pendingClaims,
      questionableClaims,
      debunkedClaims,
      avgTrustScore: avgTrustScore[0]?.avg || 0,
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
    const pending = claims.filter(
      (c) => c.verificationStatus === "pending"
    ).length;
    
    return {
      influencer,
      totalClaims: claims.length,
      verified,
      debunked,
      questionable,
      pending,
      averageTrustScore: claims.length
        ? (
            claims.reduce((sum, c) => sum + (c.trustScore || 0), 0) /
            claims.length
          ).toFixed(1)
        : 0,
    };
  }

  async getClaimStats() {
    // Aggregate claim statistics
    const stats = await Claim.aggregate([
      {
        $group: {
          _id: "$verificationStatus",
          count: { $sum: 1 },
          avgTrustScore: { $avg: "$trustScore" },
          avgConfidenceScore: { $avg: "$confidenceScore" },
        },
      },
    ]);

    const statsMap = {
      verified: { count: 0, avgTrustScore: 0, avgConfidenceScore: 0 },
      pending: { count: 0, avgTrustScore: 0, avgConfidenceScore: 0 },
      questionable: { count: 0, avgTrustScore: 0, avgConfidenceScore: 0 },
      debunked: { count: 0, avgTrustScore: 0, avgConfidenceScore: 0 },
    };

    stats.forEach((stat) => {
      if (stat._id && statsMap[stat._id]) {
        statsMap[stat._id] = {
          count: stat.count,
          avgTrustScore: stat.avgTrustScore?.toFixed(1) || 0,
          avgConfidenceScore: stat.avgConfidenceScore?.toFixed(1) || 0,
        };
      }
    });

    return statsMap;
  }
}

module.exports = new AnalyticsService();
