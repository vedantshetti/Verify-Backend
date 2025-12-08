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

  // NEW: Fetch posts from all influencers and store as claims
  async fetchAllInfluencerPosts(maxPostsPerInfluencer = 50) {
    const { fetchRecentTweets } = require("../influencers/twitter");
    const delay = require("../../helpers/delay");
    
    const influencers = await Influencer.find({});
    const results = {
      totalInfluencers: influencers.length,
      totalPostsFetched: 0,
      totalClaimsCreated: 0,
      totalClaimsUpdated: 0,
      rateLimitHit: false,
      processedInfluencers: 0,
      errors: []
    };

    for (const influencer of influencers) {
      try {
        // Fetch tweets from Twitter with retry logic
        let tweets = [];
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            tweets = await fetchRecentTweets(influencer.handle, maxPostsPerInfluencer);
            break; // Success, exit retry loop
          } catch (err) {
            if (err.response && err.response.status === 429) {
              results.rateLimitHit = true;
              
              // Check rate limit reset time
              const resetTime = err.response.headers['x-rate-limit-reset'];
              if (resetTime) {
                const waitTime = (parseInt(resetTime) * 1000) - Date.now();
                const waitMinutes = Math.ceil(waitTime / 60000);
                
                console.log(`Rate limit hit. Waiting ${waitMinutes} minutes until reset...`);
                
                // If wait time is too long (>5 min), stop processing
                if (waitTime > 300000) { // 5 minutes
                  results.errors.push({
                    influencer: influencer.handle,
                    error: `Rate limit exceeded. Please wait ${waitMinutes} minutes and try again.`
                  });
                  return results; // Stop processing all influencers
                }
                
                // Wait and retry
                await delay(waitTime + 5000); // Add 5 second buffer
                retryCount++;
              } else {
                // No reset time, wait default 15 minutes
                results.errors.push({
                  influencer: influencer.handle,
                  error: "Rate limit exceeded. Please wait 15 minutes and try again."
                });
                return results; // Stop processing
              }
            } else {
              throw err; // Re-throw non-rate-limit errors
            }
          }
        }
        
        if (tweets.length === 0) {
          results.errors.push({
            influencer: influencer.handle,
            error: "No tweets fetched after retries"
          });
          continue;
        }

        results.totalPostsFetched += tweets.length;
        results.processedInfluencers++;

        // Store posts in influencer document
        influencer.posts = tweets;
        await influencer.save();

        // Create claims from tweets
        for (const tweet of tweets) {
          try {
            // Check if claim already exists
            let claim = await Claim.findOne({ postId: tweet.id });
            
            if (claim) {
              // Update existing claim
              claim.content = tweet.text;
              claim.datePublished = new Date(tweet.createdAt);
              await claim.save();
              results.totalClaimsUpdated++;
            } else {
              // Create new claim (will be auto-verified if configured)
              claim = await Claim.create({
                postId: tweet.id,
                influencer: influencer._id,
                content: tweet.text,
                category: influencer.category || "Health",
                datePublished: new Date(tweet.createdAt),
                sourceLinks: [`https://twitter.com/${influencer.handle}/status/${tweet.id}`],
                verificationStatus: "pending",
                confidenceScore: 0,
                trustScore: 0
              });
              results.totalClaimsCreated++;
            }
          } catch (err) {
            results.errors.push({
              influencer: influencer.handle,
              tweetId: tweet.id,
              error: err.message
            });
          }
        }

        // Longer delay between influencers to avoid rate limits
        await delay(3000); // 3 seconds between each influencer
        
      } catch (err) {
        results.errors.push({
          influencer: influencer.handle,
          error: err.message
        });
        
        // If it's a rate limit error, stop processing
        if (err.response && err.response.status === 429) {
          results.rateLimitHit = true;
          return results;
        }
      }
    }

    return results;
  }
}

module.exports = new ClaimsService();
