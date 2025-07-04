const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3, maxlength: 32, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, minlength: 8 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  googleId: String,
  githubId: String,
  avatar: String,
  lastLogin: Date
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
