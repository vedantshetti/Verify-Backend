# Verify Influencers - Backend API

A Node.js/Express REST API for tracking, analyzing, and verifying health claims made by social media influencers.

## 🚀 Features

- **Authentication System** - JWT-based auth with email verification, Google & GitHub OAuth
- **Influencer Management** - Track health influencers from Twitter/X
- **AI-Powered Claim Verification** - Uses OpenAI GPT-4 to verify health claims
- **Analytics Dashboard** - Leaderboards, trends, and category statistics
- **Research Tasks** - Collaborative claim verification system
- **Automated Updates** - Daily cron jobs to fetch latest posts

## 📋 Prerequisites

- Node.js v16+ and npm
- MongoDB database
- OpenAI API key (for claim verification)
- Twitter API credentials (optional, for fetching posts)
- Google/GitHub OAuth credentials (optional, for social login)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
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

Edit `.env` and fill in your credentials:

```env
# Required
PORT=5000
MONGODB_URI=mongodb://localhost:27017/verify-influencers
JWT_SECRET=your_secure_jwt_secret
OPENAI_API_KEY=your_openai_api_key

# Email (for verification emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Optional OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

4. **Start the server**

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify-email/:token` - Verify email
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/github` - GitHub OAuth

### Influencers
- `GET /api/influencers` - List all influencers
- `GET /api/influencers/:id` - Get influencer by ID
- `POST /api/influencers` - Create influencer
- `PUT /api/influencers/:id` - Update influencer
- `GET /api/influencers/:id/posts` - Get influencer posts
- `POST /api/influencers/:id/fetch` - Fetch latest posts from Twitter

### Claims
- `GET /api/claims` - List all claims
- `GET /api/claims/:id` - Get claim by ID
- `POST /api/claims` - Create claim
- `PUT /api/claims/:id` - Update claim
- `POST /api/claims/:id/verify` - Manually verify claim
- `POST /api/claims/verify-on-demand/:id` - AI verify claim

### Analytics
- `GET /api/analytics/leaderboard` - Get influencer leaderboard
- `GET /api/analytics/trends` - Get verification trends
- `GET /api/analytics/categories` - Get category statistics
- `GET /api/analytics/summary` - Get dashboard summary
- `GET /api/analytics/influencer/:id` - Get influencer analytics

### Research
- `GET /api/research/tasks` - List research tasks
- `POST /api/research/task` - Create research task
- `PUT /api/research/task/:id` - Update research task
- `POST /api/research/evidence` - Submit evidence
- `GET /api/research/evidence/:claimId` - Get evidence for claim

## 🗄️ Database Schema

### User
- email, password, name
- OAuth provider info (Google/GitHub)
- Email verification status

### Influencer
- name, handle, bio, category
- image, followers, trust score
- Social links (Twitter, Instagram, YouTube)
- Posts array with metrics

### Claim
- postId, content, category
- Verification status (verified/questionable/debunked)
- Confidence score, trust score
- Scientific references
- Date published

### Research Task
- Claim reference
- Assigned user
- Status (open/in-progress/completed)

### Evidence
- Claim reference
- Submitted by user
- Journal, title, URL, summary
- Approval status

## 🔄 Cron Jobs

The system runs automated tasks:

- **Daily at midnight**: Updates all influencer profiles from Twitter
- Fetches latest posts and metrics
- Can be manually triggered via API

## 🔐 Security

- JWT authentication with secure tokens
- Password hashing with bcrypt
- Helmet.js for security headers
- CORS configured for frontend
- Rate limiting on sensitive endpoints
- Input validation with express-validator

## 🧪 Testing

```bash
# Run tests (when available)
npm test
```

## 📦 Project Structure

```
src/
├── config/          # Database, Passport config
├── middlewares/     # Auth, error handling
├── modules/         # Feature modules
│   ├── auth/        # Authentication
│   ├── influencers/ # Influencer management
│   ├── claims/      # Claim verification
│   ├── analytics/   # Analytics & stats
│   └── research/    # Research tasks
├── utils/           # Helper functions
├── app.js           # Express app setup
├── server.js        # Server entry point
└── cron.js          # Scheduled tasks
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Vedant Shetti

## 🐛 Known Issues

- Twitter API integration requires valid bearer token
- OAuth requires proper callback URL configuration
- Email verification requires SMTP credentials

## 🔮 Future Enhancements

- [ ] Add rate limiting per user
- [ ] Implement WebSocket for real-time updates
- [ ] Add more AI models for verification
- [ ] Integrate more social media platforms
- [ ] Add admin dashboard
- [ ] Implement caching with Redis
