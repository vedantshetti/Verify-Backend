const User = require('./auth.model');
const jwt = require('jsonwebtoken');

class AuthService {
  async register({ username, email, password }) {
    const user = new User({ username, email, password });
    await user.save();
    return user;
  }

  async login({ username, password }) {
    const user = await User.findOne({ username });
    if (!user) throw new Error('User not found');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Invalid credentials');
    user.lastLogin = new Date();
    await user.save();
    return user;
  }

  generateTokens(user) {
    const payload = { id: user._id, email: user.email, username: user.username, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }
}

module.exports = new AuthService();
