// controllers/profileController.js
const User = require('../models/userModel');

const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const imagePath = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imagePath },
      { new: true }
    );

    res.status(200).json({
      message: "Profile image uploaded successfully",
      profileImage: updatedUser.profileImage,
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    res.status(500).json({ error: "Failed to upload profile image" });
  }
};

module.exports = { uploadProfileImage };