const nodemailer = require("nodemailer");
require("dotenv").config({ path: "./config.env" });

console.log("Host:", process.env.EMAIL_HOST);
console.log("Port:", process.env.EMAIL_PORT);
console.log("User:", process.env.EMAIL_USERNAME);
console.log("Pass:", process.env.EMAIL_PASSWORD);
console.log(typeof process.env.EMAIL_PORT);

const sendEmail = async function (mailOptions) {
  console.log(process.env.EMAIL_PORT);
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
