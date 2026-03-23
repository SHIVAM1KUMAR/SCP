import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendCredentialsEmail = async (to, password) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Student Portal Login Credentials",
    html: `
      <h2>Welcome to the Student Portal</h2>
      <p>Your account has been activated. Please use the following credentials to log in:</p>
      <p><strong>Email:</strong> ${to}</p>
      <p><strong>Password:</strong> ${password}</p>
      <br />
      <p>Regards,</p>
      <p>Super Admin Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Credentials email sent to", to);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
