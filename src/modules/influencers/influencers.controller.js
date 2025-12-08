const service = require("./influencers.service");

exports.list = async (req, res) => {
  const influencers = await service.list(req.query);
  res.json({ success: true, data: influencers });
};

exports.getById = async (req, res) => {
  const influencer = await service.getById(req.params.id);
  if (!influencer)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data: influencer });
};

exports.create = async (req, res) => {
  const influencer = await service.create(req.body);
  res.status(201).json({ success: true, data: influencer });
};

exports.update = async (req, res) => {
  const influencer = await service.update(req.params.id, req.body);
  if (!influencer)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data: influencer });
};

exports.getPosts = async (req, res) => {
  const posts = await service.getPosts(req.params.id);
  res.json({ success: true, data: posts });
};

exports.fetchAndStorePosts = async (req, res) => {
  const posts = await service.fetchAndStorePosts(req.params.id);
  res.json({ success: true, data: posts });
};

// NEW: Manual trigger for updating all profiles (optional endpoint)
exports.updateAllProfilesFromTwitter = async (req, res) => {
  await service.updateAllProfilesFromTwitter();
  res.json({ success: true, message: "All profiles updated from Twitter" });
};

// NEW: Fetch health influencers from Twitter and store in database
exports.fetchAndStoreFromTwitter = async (req, res) => {
  try {
    const { keywords, category } = req.body;
    const keywordList = keywords || ['health', 'nutrition', 'fitness', 'wellness', 'diet'];
    const result = await service.fetchAndStoreHealthInfluencers(keywordList, category);
    res.json(result);
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching influencers from Twitter",
      error: err.message 
    });
  }
};

// NEW: Fetch and analyze posts for an influencer
exports.fetchAndAnalyzePosts = async (req, res) => {
  try {
    const result = await service.fetchAndAnalyzePosts(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching and analyzing posts",
      error: err.message 
    });
  }
};
