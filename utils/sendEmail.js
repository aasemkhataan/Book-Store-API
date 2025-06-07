const nodemailer = require("nodemailer");
require("dotenv").config({ path: "./config.env" });

const sendEmail = async function (mailOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: "<admin@bookstore.com>",
    subject: mailOptions.subject,
    text: mailOptions.message,
    to: mailOptions.email,
  });
};

module.exports = sendEmail;
