const Influencer = require("./influencers.model");
const { fetchTwitterProfile, fetchRecentTweets, fetchHealthInfluencers } = require("./twitter");
const delay = require("../../helpers/delay");

class InfluencerService {
  async list(query) {
    const filter = {};
    if (query.search) {
      filter.$or = [
        { name: new RegExp(query.search, "i") },
        { category: new RegExp(query.search, "i") },
      ];
    }
    if (query.category) filter.category = query.category;
    return Influencer.find(filter);
  }

  async getById(id) {
    return Influencer.findById(id);
  }

  async create(data) {
    return Influencer.create(data);
  }

  async update(id, data) {
    return Influencer.findByIdAndUpdate(id, data, { new: true });
  }

  async getPosts(id) {
    const influencer = await Influencer.findById(id);
    if (!influencer) throw new Error("Influencer not found");
    return influencer.posts || [];
  }

  async fetchAndStorePosts(id) {
    const influencer = await Influencer.findById(id);
    if (!influencer) throw new Error("Influencer not found");
    const tweets = await fetchRecentTweets(influencer.handle, 100);
    influencer.posts = tweets;
    await influencer.save();
    return tweets;
  }

  // NEW: Update influencer profile from Twitter

  async updateProfileFromTwitter(influencer) {
    const twitterData = await fetchTwitterProfile(influencer.handle);
    influencer.image = twitterData.image;
    influencer.bio = twitterData.bio;
    influencer.followers = twitterData.followers;
    await influencer.save();
    return influencer;
  }

  async updateAllProfilesFromTwitter() {
    const influencers = await Influencer.find({});
    for (const influencer of influencers) {
      let updated = false;
      while (!updated) {
        try {
          await this.updateProfileFromTwitter(influencer);
          updated = true;
          await delay(500); // 0.5 second delay
        } catch (err) {
          if (err.response && err.response.status === 429) {
            const reset = err.response.headers["x-rate-limit-reset"];
            let waitMs = 60000; // Default to 60 seconds
            if (reset) {
              waitMs = parseInt(reset, 10) * 1000 - Date.now();
              waitMs = waitMs > 0 ? waitMs : 60000;
              console.warn(
                `Rate limited. Waiting until reset in ${
                  waitMs / 1000
                } seconds...`
              );
            }
            await delay(waitMs);
            // After waiting, retry this influencer
          } else {
            console.error(
              `Error updating influencer ${influencer.handle}:`,
              err.message
            );
            updated = true; // Move on to the next influencer
          }
        }
      }
    }
  }

  // NEW: Fetch health influencers from Twitter and store in database
  async fetchAndStoreHealthInfluencers(keywords, category = "Health") {
    const twitterUsers = await fetchHealthInfluencers(keywords);
    const stored = [];
    const errors = [];

    for (const user of twitterUsers) {
      try {
        // Check if influencer already exists
        let influencer = await Influencer.findOne({ handle: user.username });
        
        if (influencer) {
          // Update existing influencer
          influencer.name = user.name;
          influencer.image = user.image;
          influencer.bio = user.bio;
          influencer.followers = user.followers;
          await influencer.save();
          stored.push({ action: 'updated', influencer });
        } else {
          // Create new influencer
          influencer = await Influencer.create({
            name: user.name,
            handle: user.username,
            image: user.image,
            bio: user.bio,
            followers: user.followers,
            category: category,
            socialLinks: {
              twitter: `https://twitter.com/${user.username}`
            }
          });
          stored.push({ action: 'created', influencer });
        }
        
        await delay(500); // Rate limiting
      } catch (error) {
        console.error(`Error storing influencer ${user.username}:`, error.message);
        errors.push({ username: user.username, error: error.message });
      }
    }

    return {
      success: true,
      stored: stored.length,
      created: stored.filter(s => s.action === 'created').length,
      updated: stored.filter(s => s.action === 'updated').length,
      errors: errors.length,
      details: { stored, errors }
    };
  }

  // NEW: Fetch posts for an influencer and analyze claims
  async fetchAndAnalyzePosts(influencerId) {
    const influencer = await Influencer.findById(influencerId);
    if (!influencer) throw new Error("Influencer not found");

    // Fetch recent tweets
    const tweets = await fetchRecentTweets(influencer.handle, 100);
    influencer.posts = tweets;
    await influencer.save();

    // TODO: Analyze tweets for health claims and verify them
    // This would integrate with your claims verification system
    
    return {
      influencer,
      postsCount: tweets.length,
      message: "Posts fetched successfully. Claim analysis pending."
    };
  }
}

module.exports = new InfluencerService();
