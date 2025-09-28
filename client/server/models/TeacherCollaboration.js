const mongoose = require('mongoose');

const teacherCollaborationSchema = new mongoose.Schema({
  mainTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaboratingTeachers: [{
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    permissions: {
      canViewStudents: { type: Boolean, default: true },
      canAddStudents: { type: Boolean, default: false },
      canEditStudents: { type: Boolean, default: false },
      canDeleteStudents: { type: Boolean, default: false },
      canCreateAssignments: { type: Boolean, default: true },
      canGradeAssignments: { type: Boolean, default: true },
      canViewAnalytics: { type: Boolean, default: true },
      canCreateReports: { type: Boolean, default: false }
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  sharedStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
teacherCollaborationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
teacherCollaborationSchema.index({ mainTeacher: 1 });
teacherCollaborationSchema.index({ 'collaboratingTeachers.teacher': 1 });
teacherCollaborationSchema.index({ 'sharedStudents.student': 1 });

module.exports = mongoose.model('TeacherCollaboration', teacherCollaborationSchema);

