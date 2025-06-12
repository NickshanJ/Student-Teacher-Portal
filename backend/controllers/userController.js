const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");
const crypto = require("crypto");

// Register
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    isApproved: role === "student" ? true : false, // auto-approve students
  });

  if (role === "student") {
    await sendEmail(
      email,
      "Welcome to Student-Teacher Portal",
      `Hi ${name},\n\nYou have successfully registered as a student in our portal.\n\nHappy learning!\n\n- The Portal Team`
    );
  }

  res.status(201).json({
    message: "Registration successful. Waiting for approval if teacher.",
  });
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).json({ message: "Invalid email or password" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Invalid email or password" });

  if (user.role === "teacher" && !user.isApproved) {
    return res
      .status(401)
      .json({ message: "Teacher not approved by admin yet" });
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
    },
  });
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token and hash it
    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token and expiry
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Use frontend URL from backend .env
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send the email
    await sendEmail(
      email,
      "Password Reset Request",
      `Hi ${user.name},\n\nClick the link to reset your password: ${resetURL}\n\nThis link will expire in 10 minutes.\n\n- The Portal Team`
    );

    res
      .status(200)
      .json({ message: "Reset password link sent to your email." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const resetToken = req.params.token;
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const { password } = req.body;

    // ✅ Validate password presence and strength
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // Send confirmation email
    await sendEmail(
      user.email,
      "Password Reset Successful",
      `Hi ${user.name},\n\nYour password has been successfully reset. If you did not perform this action, please contact support immediately.\n\n- The Portal Team`
    );

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error while resetting password" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
