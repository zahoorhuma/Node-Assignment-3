/* eslint-disable linebreak-style */
const nodemailer = require("nodemailer");
// Create a transporter using your email provider's configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "xyz@gmail.com", // removed my email due to security issues
    pass: "fhhjhjkjkjkjkjjk", // my 16 digit app pasword
  },
});

module.exports = transporter;
