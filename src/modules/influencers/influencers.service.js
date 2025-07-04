const Influencer = require("./influencers.model");
const { fetchRecentTweets } = require("./twitter");

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
}

module.exports = new InfluencerService();
