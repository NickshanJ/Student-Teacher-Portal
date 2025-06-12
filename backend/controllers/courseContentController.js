const CourseContent = require('../models/courseContentModel');
const Course = require('../models/courseModel');
const User = require('../models/userModel');

// Create new content for a course
const createContent = async (req, res) => {
  try {
    const { courseId, title, description, contentType, contentData, order } = req.body;

    // Check if course exists and if requester is the course owner
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add content to this course' });
    }

    const content = await CourseContent.create({
      course: courseId,
      title,
      description,
      contentType,
      contentData,
      order,
    });

    res.status(201).json({ message: 'Content created', content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all contents for a course (any logged-in user)
const getContentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const contents = await CourseContent.find({ course: courseId }).sort({ order: 1 });

    res.json(contents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update content (only teacher)
const updateContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const updates = req.body;

    const content = await CourseContent.findById(contentId);
    if (!content) return res.status(404).json({ message: 'Content not found' });

    // Check if user owns the course
    const course = await Course.findById(content.course);
    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this content' });
    }

    Object.assign(content, updates);
    await content.save();

    res.json({ message: 'Content updated', content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete content (only teacher)
const deleteContent = async (req, res) => {
  try {
    const { contentId } = req.params;

    const content = await CourseContent.findById(contentId);
    if (!content) return res.status(404).json({ message: 'Content not found' });

    const course = await Course.findById(content.course);
    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this content' });
    }

    await content.deleteOne();

    res.json({ message: 'Content deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all students enrolled in a course (teacher only)
const getEnrolledStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate('students', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(course.students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createContent, getContentsByCourse, updateContent, deleteContent, getEnrolledStudents };