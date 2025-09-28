const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
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
  category: {
    type: String,
    enum: ['academic', 'behavioral', 'social', 'personal', 'career', 'other'],
    default: 'academic'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  targetDate: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'cancelled', 'on_hold'],
    default: 'not_started'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  milestones: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    targetDate: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  metrics: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    unit: {
      type: String,
      trim: true
    },
    targetValue: {
      type: Number,
      required: true
    },
    currentValue: {
      type: Number,
      default: 0
    },
    measurement: {
      type: String,
      enum: ['number', 'percentage', 'boolean', 'text'],
      default: 'number'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      canView: { type: Boolean, default: true },
      canEdit: { type: Boolean, default: false },
      canDelete: { type: Boolean, default: false }
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'push', 'sms'],
      default: 'email'
    },
    time: {
      type: Date,
      required: true
    },
    message: {
      type: String,
      trim: true
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  notes: [{
    content: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: false
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
goalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate progress based on milestones and metrics
  if (this.milestones.length > 0) {
    const completedMilestones = this.milestones.filter(milestone => milestone.completed).length;
    this.progress = Math.round((completedMilestones / this.milestones.length) * 100);
  } else if (this.metrics.length > 0) {
    // Calculate progress based on metrics
    let totalProgress = 0;
    this.metrics.forEach(metric => {
      const metricProgress = Math.min((metric.currentValue / metric.targetValue) * 100, 100);
      totalProgress += metricProgress;
    });
    this.progress = Math.round(totalProgress / this.metrics.length);
  }
  
  next();
});

// Index for efficient queries
goalSchema.index({ teacher: 1, student: 1 });
goalSchema.index({ category: 1 });
goalSchema.index({ priority: 1 });
goalSchema.index({ status: 1 });
goalSchema.index({ targetDate: 1 });
goalSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Goal', goalSchema);

