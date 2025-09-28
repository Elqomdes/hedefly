const mongoose = require('mongoose');

const assignmentEvaluationSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submission: {
    content: {
      type: String,
      trim: true
    },
    attachments: [{
      filename: {
        type: String,
        required: true
      },
      originalName: {
        type: String,
        required: true
      },
      mimeType: {
        type: String,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    submittedAt: {
      type: Date,
      default: Date.now
    },
    isLate: {
      type: Boolean,
      default: false
    },
    lateDays: {
      type: Number,
      default: 0
    }
  },
  evaluation: {
    grade: {
      type: Number,
      min: 0,
      max: 100
    },
    letterGrade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'],
      default: 'F'
    },
    points: {
      earned: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        required: true
      }
    },
    criteria: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      maxPoints: {
        type: Number,
        required: true
      },
      earnedPoints: {
        type: Number,
        default: 0
      },
      feedback: {
        type: String,
        trim: true
      }
    }],
    feedback: {
      type: String,
      trim: true
    },
    strengths: [{
      type: String,
      trim: true
    }],
    improvements: [{
      type: String,
      trim: true
    }],
    suggestions: [{
      type: String,
      trim: true
    }],
    evaluatedAt: {
      type: Date
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  status: {
    type: String,
    enum: ['submitted', 'evaluated', 'returned', 'resubmitted', 'late'],
    default: 'submitted'
  },
  isResubmission: {
    type: Boolean,
    default: false
  },
  originalEvaluation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssignmentEvaluation'
  },
  resubmissionCount: {
    type: Number,
    default: 0
  },
  maxResubmissions: {
    type: Number,
    default: 2
  },
  dueDate: {
    type: Date,
    required: true
  },
  latePenalty: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  extensions: [{
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    newDueDate: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    processedAt: {
      type: Date
    }
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
assignmentEvaluationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate letter grade based on numeric grade
  if (this.evaluation.grade !== undefined) {
    const grade = this.evaluation.grade;
    if (grade >= 97) this.evaluation.letterGrade = 'A+';
    else if (grade >= 93) this.evaluation.letterGrade = 'A';
    else if (grade >= 90) this.evaluation.letterGrade = 'A-';
    else if (grade >= 87) this.evaluation.letterGrade = 'B+';
    else if (grade >= 83) this.evaluation.letterGrade = 'B';
    else if (grade >= 80) this.evaluation.letterGrade = 'B-';
    else if (grade >= 77) this.evaluation.letterGrade = 'C+';
    else if (grade >= 73) this.evaluation.letterGrade = 'C';
    else if (grade >= 70) this.evaluation.letterGrade = 'C-';
    else if (grade >= 67) this.evaluation.letterGrade = 'D+';
    else if (grade >= 63) this.evaluation.letterGrade = 'D';
    else if (grade >= 60) this.evaluation.letterGrade = 'D-';
    else this.evaluation.letterGrade = 'F';
  }
  
  // Calculate earned points from criteria
  if (this.evaluation.criteria && this.evaluation.criteria.length > 0) {
    const totalEarned = this.evaluation.criteria.reduce((sum, criterion) => sum + (criterion.earnedPoints || 0), 0);
    this.evaluation.points.earned = totalEarned;
  }
  
  next();
});

// Index for efficient queries
assignmentEvaluationSchema.index({ assignment: 1, student: 1 });
assignmentEvaluationSchema.index({ teacher: 1 });
assignmentEvaluationSchema.index({ student: 1 });
assignmentEvaluationSchema.index({ status: 1 });
assignmentEvaluationSchema.index({ 'evaluation.grade': 1 });
assignmentEvaluationSchema.index({ dueDate: 1 });

module.exports = mongoose.model('AssignmentEvaluation', assignmentEvaluationSchema);

