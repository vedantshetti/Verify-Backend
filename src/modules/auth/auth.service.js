const User = require("./auth.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../../utils/sendEmail");
const path = require("path");
const fs = require("fs");

class AuthService {
  async register({ username, email, password }) {
    // Generate a secure email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const user = new User({
      username,
      email,
      password,
      emailVerificationToken,
    });
    await user.save();

    // Prepare the verification URL
    const verifyUrl = `${process.env.BASE_URL}/api/auth/verify-email/${emailVerificationToken}`;

    // Load and personalize the HTML email template
    const templatePath = path.join(__dirname, "templates", "verifyEmail.html");
    let html = fs.readFileSync(templatePath, "utf8");
    html = html.replace("{{VERIFY_URL}}", verifyUrl);

    // Send the verification email
    await sendEmail(
      email,
      "Verify your email",
      `Click to verify: ${verifyUrl}`,
      html
    );

    return user;
  }

  async verifyEmail(token) {
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) throw new Error("Invalid or expired verification token");
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    return user;
  }

  async login({ username, password }) {
    const user = await User.findOne({ username });
    if (!user) throw new Error("User not found");
    if (!user.isEmailVerified) throw new Error("Email not verified");
    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error("Invalid credentials");
    user.lastLogin = new Date();
    await user.save();
    return user;
  }

  generateTokens(user) {
    const payload = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return { accessToken, refreshToken };
  }

  // Google OAuth
  async findOrCreateGoogle(profile) {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        username: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        isEmailVerified: true,
        avatar: profile.photos[0]?.value,
      });
    }
    return user;
  }

  // GitHub OAuth
  async findOrCreateGitHub(profile) {
    let user = await User.findOne({ githubId: profile.id });
    if (!user) {
      user = await User.create({
        username: profile.username,
        email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
        githubId: profile.id,
        isEmailVerified: true,
        avatar: profile.photos[0]?.value,
      });
    }
    return user;
  }
}

module.exports = new AuthService();
