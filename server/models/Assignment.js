const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  subject: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['individual', 'class'],
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    type: String,
    size: Number
  }],
  videoLinks: [{
    title: String,
    url: String,
    description: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    attachments: [{
      filename: String,
      originalName: String,
      path: String,
      type: String,
      size: Number
    }],
    text: String,
    grade: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: String,
    isGraded: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
assignmentSchema.index({ teacher: 1 });
assignmentSchema.index({ class: 1 });
assignmentSchema.index({ 'students': 1 });
assignmentSchema.index({ subject: 1 });
assignmentSchema.index({ type: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ isActive: 1 });
assignmentSchema.index({ createdAt: -1 });
assignmentSchema.index({ 'submissions.student': 1 });
assignmentSchema.index({ 'submissions.isGraded': 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);

