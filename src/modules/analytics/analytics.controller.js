const service = require("./analytics.service");

exports.leaderboard = async (req, res) => {
  const data = await service.getLeaderboard(req.query);
  res.json({ success: true, data });
};

exports.trends = async (req, res) => {
  const data = await service.getTrends(req.query);
  res.json({ success: true, data });
};

exports.categories = async (req, res) => {
  const data = await service.getCategoryStats();
  res.json({ success: true, data });
};

exports.summary = async (req, res) => {
  const data = await service.getSummary();
  res.json({ success: true, data });
};

exports.influencer = async (req, res) => {
  const data = await service.getInfluencerAnalytics(req.params.id);
  res.json({ success: true, data });
};
