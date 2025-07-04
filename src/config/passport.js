const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../modules/auth/auth.model");
const authService = require("../modules/auth/auth.service");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await authService.findOrCreateGoogle(profile);
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // GitHub may not always return email; handle accordingly
        const user = await authService.findOrCreateGitHub(profile);
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
