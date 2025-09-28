const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
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
  collaboratingTeachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  subject: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  assignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  }],
  exams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam'
  }]
}, {
  timestamps: true
});

// Indexes for better performance
classSchema.index({ teacher: 1 });
classSchema.index({ 'collaboratingTeachers': 1 });
classSchema.index({ 'students': 1 });
classSchema.index({ subject: 1 });
classSchema.index({ grade: 1 });
classSchema.index({ isActive: 1 });
classSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Class', classSchema);

