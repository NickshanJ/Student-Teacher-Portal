const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileUrl: String,
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  grade: {
    type: Number,
    default: null,
  },
  feedback: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);