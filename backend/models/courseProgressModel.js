const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  content: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseContent', required: true },
  completedAt: { type: Date, default: Date.now }
});

courseProgressSchema.index({ student: 1, course: 1, content: 1 }, { unique: true });

module.exports = mongoose.model('CourseProgress', courseProgressSchema);