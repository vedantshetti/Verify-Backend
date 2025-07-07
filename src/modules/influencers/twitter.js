const axios = require("axios");

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN; // Set in .env

// Fetch latest Twitter profile info (bio, image, etc.)
async function fetchTwitterProfile(username) {
  const url = `https://api.twitter.com/2/users/by/username/${username}?user.fields=profile_image_url,description,public_metrics`;
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
  });
  const user = res.data.data;
  return {
    image: user.profile_image_url,
    bio: user.description,
    followers: user.public_metrics.followers_count,
  };
}

// Fetch recent tweets (if needed)
async function fetchRecentTweets(username, maxResults = 100) {
  const userRes = await axios.get(
    `https://api.twitter.com/2/users/by/username/${username}`,
    { headers: { Authorization: `Bearer ${BEARER_TOKEN}` } }
  );
  const userId = userRes.data.data.id;
  const tweetsRes = await axios.get(
    `https://api.twitter.com/2/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics`,
    { headers: { Authorization: `Bearer ${BEARER_TOKEN}` } }
  );
  return tweetsRes.data.data.map((tweet) => ({
    id: tweet.id,
    text: tweet.text,
    createdAt: tweet.created_at,
    metrics: {
      retweets: tweet.public_metrics.retweet_count,
      likes: tweet.public_metrics.like_count,
      replies: tweet.public_metrics.reply_count,
    },
  }));
}

module.exports = { fetchTwitterProfile, fetchRecentTweets };
