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

// NEW: Fetch all influencer posts and store as claims
exports.fetchAllInfluencerPosts = async (req, res) => {
  try {
    const { maxPostsPerInfluencer } = req.body;
    const results = await service.fetchAllInfluencerPosts(maxPostsPerInfluencer || 50);
    
    // Add helpful message about rate limits
    if (results.rateLimitHit) {
      results.message = "Rate limit reached. Please wait 15 minutes before fetching more posts.";
    } else if (results.processedInfluencers < results.totalInfluencers) {
      results.message = `Processed ${results.processedInfluencers} of ${results.totalInfluencers} influencers. Some failed due to rate limits.`;
    } else {
      results.message = "Successfully fetched posts from all influencers!";
    }
    
    res.json({ success: true, data: results });
  } catch (err) {
    console.error("fetchAllInfluencerPosts error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// NEW: Fetch posts from a single influencer
exports.fetchInfluencerPosts = async (req, res) => {
  try {
    const { influencerId } = req.params;
    const { maxPosts } = req.body;
    
    const Influencer = require("../influencers/influencers.model");
    const { fetchRecentTweets } = require("../influencers/twitter");
    
    const influencer = await Influencer.findById(influencerId);
    if (!influencer) {
      return res.status(404).json({ success: false, message: "Influencer not found" });
    }
    
    const tweets = await fetchRecentTweets(influencer.handle, maxPosts || 50);
    
    // Store posts
    influencer.posts = tweets;
    await influencer.save();
    
    // Create claims
    let claimsCreated = 0;
    let claimsUpdated = 0;
    
    for (const tweet of tweets) {
      let claim = await service.list({ postId: tweet.id });
      
      if (claim && claim.length > 0) {
        claim = claim[0];
        claim.content = tweet.text;
        claim.datePublished = new Date(tweet.createdAt);
        await claim.save();
        claimsUpdated++;
      } else {
        await service.create({
          postId: tweet.id,
          influencer: influencer._id,
          content: tweet.text,
          category: influencer.category || "Health",
          datePublished: new Date(tweet.createdAt),
          sourceLinks: [`https://twitter.com/${influencer.handle}/status/${tweet.id}`],
          verificationStatus: "pending"
        });
        claimsCreated++;
      }
    }
    
    res.json({ 
      success: true, 
      data: {
        influencer: influencer.name,
        postsFetched: tweets.length,
        claimsCreated,
        claimsUpdated
      }
    });
  } catch (err) {
    console.error("fetchInfluencerPosts error:", err);
    
    if (err.response && err.response.status === 429) {
      return res.status(429).json({ 
        success: false, 
        message: "Twitter API rate limit exceeded. Please wait 15 minutes and try again.",
        rateLimitReset: err.response.headers['x-rate-limit-reset']
      });
    }
    
    res.status(500).json({ success: false, message: err.message });
  }
};
