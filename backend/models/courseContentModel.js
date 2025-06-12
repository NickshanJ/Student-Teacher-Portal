const mongoose = require('mongoose');

const courseContentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  contentType: {
    type: String,
    enum: ['video', 'article', 'quiz'],
    required: true,
  },
  contentData: {
    // Store URL for video, text for article, or quiz JSON for quiz
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('CourseContent', courseContentSchema);