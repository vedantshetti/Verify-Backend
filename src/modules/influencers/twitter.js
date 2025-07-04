const axios = require("axios");

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN; // Set in .env

async function fetchRecentTweets(username, maxResults = 100) {
  // 1. Get user ID from username
  const userRes = await axios.get(
    `https://api.twitter.com/2/users/by/username/${username}`,
    { headers: { Authorization: `Bearer ${BEARER_TOKEN}` } }
  );
  const userId = userRes.data.data.id;

  // 2. Get up to 100 recent tweets
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

module.exports = { fetchRecentTweets };
