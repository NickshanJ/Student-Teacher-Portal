// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const { uploadProfileImage } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload-image', protect, upload.single('profileImage'), uploadProfileImage);

module.exports = router;