const CourseContent = require('../models/courseContentModel');
const CourseProgress = require('../models/courseProgressModel');
const mongoose = require('mongoose');

// Mark content as completed
const markContentCompleted = async (req, res) => {
  let { courseId, contentId } = req.body;
  try {
    // Ensure IDs are ObjectId type
    if (typeof courseId === 'string') courseId = courseId.replace(/['"<>]/g, '');
    if (typeof contentId === 'string') contentId = contentId.replace(/['"<>]/g, '');
    courseId = new mongoose.Types.ObjectId(courseId);
    contentId = new mongoose.Types.ObjectId(contentId);

    const existing = await CourseProgress.findOne({
      student: req.user._id,
      course: courseId,
      content: contentId
    });

    if (existing) {
      return res.status(200).json({ message: 'Already marked as completed' });
    }

    const progress = await CourseProgress.create({
      student: req.user._id,
      course: courseId,
      content: contentId
    });

    res.status(201).json({ message: 'Progress saved', progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get completed contents for a course, and return progress percentage
const getCompletedContents = async (req, res) => {
  const { courseId } = req.params;

  try {
    // 1. Get all content for the course
    const allContents = await CourseContent.find({ course: courseId }).select('_id');
    const total = allContents.length;

    // 2. Get completed content for this student
    const completed = await CourseProgress.find({
      student: req.user._id,
      course: courseId
    }).select('content');

    const completedContentIds = completed.map(p => p.content.toString());
    const completedCount = completedContentIds.length;

    // 3. Calculate progress percentage
    const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    res.json({ completedContentIds, progress });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { markContentCompleted, getCompletedContents };