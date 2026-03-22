import generateToken from "../utils/generateToken.js";

export const superAdminLogin = (req, res) => {

  const { email, password } = req.body;

  if (
    email === process.env.SUPER_ADMIN_EMAIL &&
    password === process.env.SUPER_ADMIN_PASSWORD
  ) {

    const token = generateToken({
      role: "superadmin",
      email: email
    });

    return res.json({
      message: "Super Admin Logged In",
      role: "superadmin",
      token
    });
  }

  res.status(401).json({
    message: "Invalid credentials"
  });
};