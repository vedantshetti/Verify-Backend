# Health Influencer Verification API Workflow

## Project Overview

This platform analyzes health influencers on Twitter/social media to:
1. **Fetch** health influencers from Twitter
2. **Store** their profiles in MongoDB
3. **Analyze** their posts for health claims
4. **Verify** claims using AI
5. **Assign** trust scores based on accuracy

---

## 🚀 Quick Start: Fetching Influencers from Twitter

### Step 1: Fetch Health Influencers from Twitter

**Endpoint:** `POST /api/influencers/fetch-from-twitter`

This is your **main endpoint** to populate the database with health influencers.

**Request Body:**
```json
{
  "keywords": ["health", "nutrition", "fitness", "wellness", "diet", "medical"],
  "category": "Health"
}
```

**What it does:**
- Searches Twitter for users posting about health topics
- Filters for users with 1000+ followers
- Extracts: name, username, bio, followers, profile image
- Stores in MongoDB (creates new or updates existing)

**Response:**
```json
{
  "success": true,
  "stored": 25,
  "created": 20,
  "updated": 5,
  "errors": 0,
  "details": {
    "stored": [...],
    "errors": []
  }
}
```

---

### Step 2: View Stored Influencers

**Endpoint:** `GET /api/influencers`

**Query Parameters:**
- `search` - Search by name or category
- `category` - Filter by category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Dr. Health Expert",
      "handle": "drhealthexpert",
      "bio": "Nutritionist | Health Coach",
      "category": "Health",
      "followers": 50000,
      "trustScore": 85,
      "verifiedClaims": 12,
      "image": "https://...",
      "posts": []
    }
  ]
}
```

---

### Step 3: Fetch and Analyze Posts

**Endpoint:** `POST /api/influencers/:id/analyze-posts`

**What it does:**
- Fetches last 100 tweets from the influencer
- Stores posts with metrics (likes, retweets, replies)
- Ready for claim analysis

**Response:**
```json
{
  "success": true,
  "data": {
    "influencer": {...},
    "postsCount": 100,
    "message": "Posts fetched successfully. Claim analysis pending."
  }
}
```

---

### Step 4: Update Existing Profiles

**Endpoint:** `POST /api/influencers/update-all-twitter`

Updates all existing influencers with latest Twitter data (followers, bio, image).

---

## 📊 Complete Workflow

```
1. Fetch Influencers from Twitter
   ↓
2. Store in MongoDB
   ↓
3. Fetch Their Posts
   ↓
4. Extract Health Claims (AI)
   ↓
5. Verify Claims (AI + Research)
   ↓
6. Calculate Trust Score
   ↓
7. Display on Leaderboard
```

---

## 🎯 Key Endpoints Summary

### Influencer Management
- `POST /api/influencers/fetch-from-twitter` - **Import new influencers**
- `GET /api/influencers` - List all influencers
- `GET /api/influencers/:id` - Get specific influencer
- `POST /api/influencers/:id/analyze-posts` - Fetch & analyze posts
- `POST /api/influencers/update-all-twitter` - Update existing profiles

### Claims Verification
- `GET /api/claims` - List all claims
- `POST /api/claims` - Create claim
- `POST /api/claims/:id/verify` - Verify claim with AI
- `POST /api/claims/get-or-verify` - Get existing or verify new claim

### Analytics
- `GET /api/analytics/leaderboard` - Influencer rankings
- `GET /api/analytics/influencer/:id` - Specific influencer analytics
- `GET /api/analytics/summary` - Overall statistics

---

## 🔧 Configuration

### Environment Variables Required

```env
# Twitter API (Required for fetching influencers)
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# OpenAI (For claim verification)
OPENAI_API_KEY=your_openai_api_key

# Perplexity (For research)
PERPLEXITY_API_KEY=your_perplexity_api_key
```

---

## 🎨 Frontend Integration

### Fetch Influencers Button
```javascript
// In your React component
const handleFetchFromTwitter = async () => {
  const keywords = ['health', 'nutrition', 'fitness', 'wellness'];
  const response = await influencerService.fetchAndStoreFromTwitter(keywords, 'Health');
  
  if (response.success) {
    console.log(`Created: ${response.created}, Updated: ${response.updated}`);
  }
};
```

### Display Influencers
```javascript
const fetchInfluencers = async () => {
  const response = await influencerService.getAll();
  setInfluencers(response.data);
};
```

---

## 📝 Example Use Case

**Scenario:** You want to build a database of nutrition influencers

1. **Call:** `POST /api/influencers/fetch-from-twitter`
   ```json
   {
     "keywords": ["nutrition", "diet", "nutritionist", "dietitian"],
     "category": "Nutrition"
   }
   ```

2. **Result:** 30 nutrition influencers stored in DB

3. **Next:** For each influencer, call `POST /api/influencers/:id/analyze-posts` to fetch their tweets

4. **Then:** Extract health claims from tweets and verify them

5. **Finally:** Calculate trust scores and display on leaderboard

---

## 🚨 Rate Limiting

Twitter API has rate limits:
- The system includes automatic delays (500ms between requests)
- Handles rate limit errors gracefully
- Waits and retries when rate limited

---

## 💡 Tips

1. **Start Small:** Fetch 10-20 influencers first to test the workflow
2. **Keywords Matter:** Use specific health-related keywords for better results
3. **Regular Updates:** Run update endpoint daily to keep data fresh
4. **Claim Analysis:** Integrate AI to automatically extract and verify claims from posts

---

## 🔗 Postman Collection

Import `Verify-Backend-Postman-Collection.json` to test all endpoints easily!
