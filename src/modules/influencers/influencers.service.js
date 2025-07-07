const Influencer = require("./influencers.model");
const { fetchTwitterProfile, fetchRecentTweets } = require("./twitter");

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

  // NEW: Update all influencers from Twitter (for cron job)
  async updateAllProfilesFromTwitter() {
    const influencers = await Influencer.find({});
    for (const influencer of influencers) {
      await this.updateProfileFromTwitter(influencer);
    }
  }
}

module.exports = new InfluencerService();
