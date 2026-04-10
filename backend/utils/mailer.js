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

export const sendCollegeCredentialsEmail = async (to, password) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Your College Portal Login Credentials",
    html: `
      <h2>Welcome to the College Portal</h2>
      <p>Your college application has been approved and your account is now active.</p>
      <p>Please use the following credentials to log in:</p>
      <p><strong>Email:</strong> ${to}</p>
      <p><strong>Password:</strong> ${password}</p>
      <br />
      <p>Regards,</p>
      <p>Super Admin Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("College credentials email sent to", to);
  } catch (error) {
    console.error("Error sending college email:", error);
  }
};

export const sendCounsellorCredentialsEmail = async (to, password) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Counsellor Portal Login Credentials",
    html: `
      <h2>Welcome to the Counsellor Portal</h2>
      <p>Your counselor account is now active.</p>
      <p>Please use the following credentials to log in:</p>
      <p><strong>Email:</strong> ${to}</p>
      <p><strong>Password:</strong> ${password}</p>
      <br />
      <p>Regards,</p>
      <p>Super Admin Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Counsellor credentials email sent to", to);
  } catch (error) {
    console.error("Error sending counsellor email:", error);
  }
};

export const sendPasswordResetEmail = async (to, role, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `${role} Password Reset Request`,
    html: `
      <h2>Password Reset Request</h2>
      <p>We received a request to reset the password for your ${role.toLowerCase()} account.</p>
      <p>Click the link below to set a new password:</p>
      <p><a href="${resetUrl}" target="_blank" rel="noreferrer">Reset Password</a></p>
      <p>If the button does not work, copy and paste this URL into your browser:</p>
      <p>${resetUrl}</p>
      <br />
      <p>Regards,</p>
      <p>EduAdmit Support Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent to", to);
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};

export const sendPasswordResetOtpEmail = async (to, role, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `${role} Password Reset OTP`,
    html: `
      <h2>Password Reset OTP</h2>
      <p>Use the OTP below to verify your ${role.toLowerCase()} account recovery request:</p>
      <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 18px 0; color: #0f2044;">${otp}</div>
      <p>This OTP will expire soon. If you did not request a password reset, you can ignore this email.</p>
      <br />
      <p>Regards,</p>
      <p>EduAdmit Support Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset OTP email sent to", to);
  } catch (error) {
    console.error("Error sending password reset OTP email:", error);
  }
};
