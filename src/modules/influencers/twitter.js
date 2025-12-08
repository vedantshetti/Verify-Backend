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
    id: user.id,
    name: user.name,
    username: user.username,
    image: user.profile_image_url,
    bio: user.description,
    followers: user.public_metrics.followers_count,
  };
}

// Search for Twitter users by keyword (e.g., "health", "nutrition", "fitness")
async function searchTwitterUsers(query, maxResults = 10) {
  try {
    // Twitter API v2 doesn't have direct user search, so we search tweets and extract unique users
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${maxResults}&expansions=author_id&user.fields=profile_image_url,description,public_metrics`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
    });
    
    if (!res.data.includes || !res.data.includes.users) {
      return [];
    }

    return res.data.includes.users.map(user => ({
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.profile_image_url,
      bio: user.description,
      followers: user.public_metrics.followers_count,
    }));
  } catch (error) {
    console.error('Error searching Twitter users:', error.response?.data || error.message);
    throw error;
  }
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

// Fetch health influencers by searching for health-related keywords
async function fetchHealthInfluencers(keywords = ['health', 'nutrition', 'fitness', 'wellness'], maxResults = 50) {
  const allUsers = new Map(); // Use Map to avoid duplicates
  
  for (const keyword of keywords) {
    try {
      const query = `${keyword} (doctor OR nutritionist OR dietitian OR fitness OR health coach) -is:retweet lang:en`;
      const users = await searchTwitterUsers(query, maxResults);
      
      users.forEach(user => {
        // Only add if not already present and has substantial following
        if (!allUsers.has(user.id) && user.followers >= 1000) {
          allUsers.set(user.id, user);
        }
      });
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error fetching influencers for keyword ${keyword}:`, error.message);
    }
  }
  
  return Array.from(allUsers.values());
}

module.exports = { 
  fetchTwitterProfile, 
  fetchRecentTweets, 
  searchTwitterUsers,
  fetchHealthInfluencers 
};
