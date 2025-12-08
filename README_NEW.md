# VerifyInfluencers - Backend API 🚀

![Node.js](https://img.shields.io/badge/Node.js-18.x-green) ![Express](https://img.shields.io/badge/Express-5.1.0-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-8.15-brightgreen) ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange)

A comprehensive backend API for verifying health claims from social media influencers using AI-powered analysis and scientific research.

## 🎯 Features

- **AI-Powered Claim Verification**: OpenAI GPT-4 integration for automated fact-checking
- **Twitter Integration**: Fetch and analyze tweets from health influencers
- **Research Reports**: Generate comprehensive health topic research using AI
- **Analytics Dashboard**: Track influencer trust scores, verification statistics
- **User Authentication**: JWT-based authentication with email verification
- **OAuth Integration**: Google & GitHub login support
- **Real-time Monitoring**: Track claim verification status and trends
- **Scientific Journal Cross-referencing**: Validate claims against research

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Key Features](#key-features)

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.1
- **Database**: MongoDB with Mongoose ODM
- **AI/ML**: OpenAI GPT-4o API
- **Social Media**: Twitter API v2
- **Authentication**: JWT, Passport.js (Google OAuth, GitHub OAuth)
- **Email**: Nodemailer
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## 📦 Prerequisites

- Node.js 18.x or higher
- MongoDB 6.x or higher
- OpenAI API Key
- Twitter API v2 Bearer Token
- Gmail account (for email notifications)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vedantshetti/Verify-Backend.git
   cd Verify-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration (see [Environment Variables](#environment-variables))

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/verify-influencers

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key-here

# Twitter API v2
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
Server runs on `http://localhost:5000` with auto-reload enabled.

### Production Mode
```bash
npm start
```

### Testing API
```bash
# Using curl
curl http://localhost:5000/api/health

# Using Postman
# Import the Postman collection from Verify-Backend-Postman-Collection.json
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/verify-email` | Verify email with token | No |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/auth/google` | Google OAuth login | No |
| GET | `/api/auth/github` | GitHub OAuth login | No |

### Influencers
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/influencers` | Get all influencers | Yes |
| GET | `/api/influencers/:id` | Get influencer by ID | Yes |
| POST | `/api/influencers` | Create new influencer | Yes |
| PUT | `/api/influencers/:id` | Update influencer | Yes |
| DELETE | `/api/influencers/:id` | Delete influencer | Yes |
| POST | `/api/influencers/:id/fetch-posts` | Fetch Twitter posts | Yes |

### Claims
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/claims` | Get all claims | Yes |
| GET | `/api/claims/:id` | Get claim by ID | Yes |
| POST | `/api/claims` | Create new claim | Yes |
| PUT | `/api/claims/:id` | Update claim | Yes |
| DELETE | `/api/claims/:id` | Delete claim | Yes |
| POST | `/api/claims/:id/verify-ai` | Verify claim with AI | Yes |
| POST | `/api/claims/verify-multiple-ai` | Batch verify claims | Yes |
| POST | `/api/claims/verify-pending-ai` | Auto-verify pending claims | Yes |

### Analytics
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/analytics/summary` | Get dashboard summary | Yes |
| GET | `/api/analytics/leaderboard` | Get influencer rankings | Yes |
| GET | `/api/analytics/categories` | Get category statistics | Yes |
| GET | `/api/analytics/claim-stats` | Get claim breakdown | Yes |
| GET | `/api/analytics/trends` | Get verification trends | Yes |
| GET | `/api/analytics/influencer/:id` | Get influencer analytics | Yes |

### Research
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/research/report` | Generate AI research report | Yes |
| GET | `/api/research/reports` | Get all reports | Yes |
| GET | `/api/research/report/:id` | Get report by ID | Yes |
| DELETE | `/api/research/report/:id` | Delete report | Yes |
| GET | `/api/research/tasks` | Get research tasks | Yes |
| POST | `/api/research/task` | Create research task | Yes |

## 📁 Project Structure

```
Verify-Backend/
├── src/
│   ├── modules/
│   │   ├── auth/                 # Authentication & user management
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.model.js
│   │   │   └── templates/
│   │   │       └── verifyEmail.html
│   │   ├── influencers/          # Influencer management
│   │   │   ├── influencers.controller.js
│   │   │   ├── influencers.service.js
│   │   │   ├── influencers.routes.js
│   │   │   ├── influencers.model.js
│   │   │   └── twitter.js        # Twitter API integration
│   │   ├── claims/               # Claim verification
│   │   │   ├── claims.controller.js
│   │   │   ├── claims.service.js
│   │   │   ├── claims.routes.js
│   │   │   └── claims.model.js
│   │   ├── analytics/            # Analytics & statistics
│   │   │   ├── analytics.controller.js
│   │   │   ├── analytics.service.js
│   │   │   ├── analytics.routes.js
│   │   │   └── analytics.model.js
│   │   └── research/             # AI research reports
│   │       ├── research.controller.js
│   │       ├── research.service.js
│   │       ├── research.routes.js
│   │       └── research.model.js
│   ├── config/
│   │   ├── database.js           # MongoDB connection
│   │   └── passport.js           # OAuth strategies
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT verification
│   │   └── errorHandler.js       # Global error handler
│   ├── utils/
│   │   ├── openai.js             # OpenAI GPT-4 integration
│   │   ├── response.js           # Standardized API responses
│   │   ├── sendEmail.js          # Email service
│   │   └── perplexity.js         # Perplexity API (optional)
│   ├── helpers/
│   │   └── delay.js              # Rate limiting utilities
│   ├── app.js                    # Express app setup
│   ├── server.js                 # Server entry point
│   └── cron.js                   # Scheduled tasks
├── logs/                         # Application logs
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── package.json
├── API_WORKFLOW.md              # Detailed API documentation
└── README.md

```

## 🔑 Key Features

### 1. AI-Powered Claim Verification

```javascript
// Automatically verify claims using OpenAI GPT-4
POST /api/claims/:id/verify-ai

Response:
{
  "verificationStatus": "verified",
  "trustScore": 85,
  "confidenceScore": 90,
  "explanation": "This claim is supported by multiple peer-reviewed studies...",
  "scientificReferences": [...]
}
```

### 2. Research Report Generation

```javascript
// Generate comprehensive health topic research
POST /api/research/report
{
  "topic": "intermittent fasting",
  "verifyJournals": true,
  "selectedJournals": ["PubMed Central", "Nature", "The Lancet"]
}

Response:
{
  "scientificConsensus": "...",
  "commonClaims": [...],
  "riskFactors": [...],
  "suggestedInfluencers": [...]
}
```

### 3. Twitter Integration

```javascript
// Fetch latest tweets from influencer
POST /api/influencers/:id/fetch-posts

Response:
{
  "postsProcessed": 50,
  "newClaims": 12,
  "updatedClaims": 5
}
```

### 4. Analytics Dashboard

```javascript
// Get comprehensive statistics
GET /api/analytics/summary

Response:
{
  "activeInfluencers": 35,
  "claimsVerified": 428,
  "averageTrustScore": 85.7,
  "verifiedClaims": 320,
  "pendingClaims": 49,
  "questionableClaims": 42,
  "debunkedClaims": 17
}
```

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Register & Login
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Password123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123!"}'

# Response includes token
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Using the Token
```bash
curl -X GET http://localhost:5000/api/claims \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🤖 OpenAI Integration

The system uses OpenAI GPT-4o for:
- Claim verification with trust & confidence scores
- Scientific reference extraction
- Health topic research report generation
- Common claim analysis (true/false)
- Risk factor identification
- Expert influencer suggestions

**Scoring System:**
- **Trust Score (1-100)**: How trustworthy the claim is
  - 85-100: Proven facts
  - 70-84: Highly likely true
  - 55-69: Likely true
  - 40-54: Mixed evidence
  - 25-39: Likely false
  - 1-24: Clearly false
  
- **Confidence Score (1-100)**: How confident AI is in the verdict

## 🐦 Twitter API Integration

**Features:**
- Fetch recent tweets from health influencers
- Extract health-related claims from posts
- Rate limit handling (50 requests per 15 minutes)
- Automatic claim creation and updating
- Tweet metadata extraction (likes, retweets, views)

**Supported Filters:**
- Time-based filtering
- Health-related keyword detection
- Duplicate claim prevention

## 📊 Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  isVerified: Boolean,
  verificationToken: String,
  role: ['user', 'admin']
}
```

### Influencer
```javascript
{
  name: String,
  handle: String,
  twitterId: String,
  category: String,
  image: String,
  followers: Number,
  trustScore: Number,
  verifiedClaims: Number,
  posts: [TwitterPost]
}
```

### Claim
```javascript
{
  influencer: ObjectId,
  content: String,
  datePublished: Date,
  verificationStatus: ['pending', 'verified', 'questionable', 'debunked'],
  trustScore: Number,
  confidenceScore: Number,
  verifiedBy: String,
  explanation: String,
  scientificReferences: [Reference],
  tweetData: Object
}
```

### ResearchReport
```javascript
{
  topic: String,
  scientificConsensus: String,
  commonClaims: [{claim, isTrue, explanation}],
  riskFactors: [String],
  considerations: [String],
  relevantJournals: [Journal],
  suggestedInfluencers: [Influencer],
  summary: String,
  keyTakeaways: [String],
  status: ['pending', 'completed', 'failed']
}
```

## 🚨 Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message here",
  "details": { ... }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 📝 Logging

Winston logger with file and console transports:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

## 🔄 Scheduled Tasks

Cron jobs for automated maintenance:
- Daily claim verification
- Weekly trust score recalculation
- Monthly analytics aggregation

## 🛡️ Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Prevent API abuse
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Express Validator
- **SQL Injection Prevention**: Mongoose ODM
- **XSS Protection**: Input sanitization

## 📚 Additional Resources

- [Detailed API Documentation](./API_WORKFLOW.md)
- [Postman Collection](./Verify-Backend-Postman-Collection.json)
- [Frontend Repository](https://github.com/vedantshetti/verify-infulencers)

## 👨‍💻 Author

**Vedant Shetti**
- GitHub: [@vedantshetti](https://github.com/vedantshetti)
- LinkedIn: [Vedant Shetti](https://linkedin.com/in/vedantshetti)

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Made with ❤️ for healthier social media**
