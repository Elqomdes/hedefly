const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['quiz', 'midterm', 'final', 'practice', 'diagnostic', 'other'],
    default: 'quiz'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  grade: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  totalPoints: {
    type: Number,
    required: true,
    default: 100
  },
  questions: [{
    type: {
      type: String,
      enum: ['multiple_choice', 'true_false', 'short_answer', 'essay', 'fill_blank', 'matching'],
      required: true
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    options: [{
      text: {
        type: String,
        required: true,
        trim: true
      },
      isCorrect: {
        type: Boolean,
        default: false
      }
    }],
    correctAnswer: {
      type: String,
      trim: true
    },
    points: {
      type: Number,
      required: true,
      default: 1
    },
    explanation: {
      type: String,
      trim: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    tags: [{
      type: String,
      trim: true
    }]
  }],
  settings: {
    shuffleQuestions: {
      type: Boolean,
      default: false
    },
    shuffleOptions: {
      type: Boolean,
      default: false
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true
    },
    showExplanations: {
      type: Boolean,
      default: true
    },
    allowReview: {
      type: Boolean,
      default: true
    },
    timeLimit: {
      type: Number, // in minutes
      default: null
    },
    attempts: {
      max: {
        type: Number,
        default: 1
      },
      current: {
        type: Number,
        default: 0
      }
    },
    password: {
      type: String,
      trim: true
    },
    proctoring: {
      enabled: {
        type: Boolean,
        default: false
      },
      settings: {
        blockCopyPaste: {
          type: Boolean,
          default: false
        },
        blockRightClick: {
          type: Boolean,
          default: false
        },
        fullScreenRequired: {
          type: Boolean,
          default: false
        },
        webcamRequired: {
          type: Boolean,
          default: false
        }
      }
    }
  },
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    timezone: {
      type: String,
      default: 'Europe/Istanbul'
    }
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  assignedTo: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  results: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answers: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      answer: {
        type: String,
        trim: true
      },
      isCorrect: {
        type: Boolean,
        default: false
      },
      points: {
        type: Number,
        default: 0
      },
      timeSpent: {
        type: Number, // in seconds
        default: 0
      }
    }],
    score: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'],
      default: 'F'
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'abandoned', 'timeout'],
      default: 'not_started'
    },
    attempt: {
      type: Number,
      default: 1
    }
  }],
  analytics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    },
    questionStats: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      correctCount: {
        type: Number,
        default: 0
      },
      totalAttempts: {
        type: Number,
        default: 0
      },
      averageTime: {
        type: Number,
        default: 0
      }
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'cancelled'],
    default: 'draft'
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateName: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
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
examSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate total points from questions
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce((sum, question) => sum + question.points, 0);
  }
  
  next();
});

// Index for efficient queries
examSchema.index({ teacher: 1 });
examSchema.index({ type: 1 });
examSchema.index({ subject: 1 });
examSchema.index({ grade: 1 });
examSchema.index({ status: 1 });
examSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
examSchema.index({ isTemplate: 1 });

module.exports = mongoose.model('Exam', examSchema);