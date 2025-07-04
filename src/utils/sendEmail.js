const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or your SMTP provider
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_APPPASS,
  },
});

module.exports = async (to, subject, text, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_SENDER,
    to,
    subject,
    text,
    html,
  });
};
