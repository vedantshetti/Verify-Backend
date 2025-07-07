const Influencer = require("./influencers.model");
const { fetchTwitterProfile, fetchRecentTweets } = require("./twitter");
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
}

module.exports = new InfluencerService();
