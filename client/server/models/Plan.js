const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  subjects: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    topics: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      estimatedTime: {
        type: Number, // in minutes
        default: 60
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
    }]
  }],
  tasks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    dueDate: {
      type: Date
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    estimatedTime: {
      type: Number, // in minutes
      default: 60
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  goals: [{
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
      type: Date
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
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
planSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate progress based on completed topics, tasks and goals
  if (this.subjects.length > 0 || this.tasks.length > 0 || this.goals.length > 0) {
    let totalItems = 0;
    let completedItems = 0;
    
    // Count subjects topics
    this.subjects.forEach(subject => {
      totalItems += subject.topics.length;
      completedItems += subject.topics.filter(topic => topic.completed).length;
    });
    
    // Count tasks
    totalItems += this.tasks.length;
    completedItems += this.tasks.filter(task => task.isCompleted).length;
    
    // Count goals
    totalItems += this.goals.length;
    completedItems += this.goals.filter(goal => goal.completed).length;
    
    this.progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  }
  
  next();
});

// Index for efficient queries
planSchema.index({ teacher: 1, student: 1 });
planSchema.index({ type: 1 });
planSchema.index({ startDate: 1, endDate: 1 });
planSchema.index({ status: 1 });
planSchema.index({ isTemplate: 1 });

module.exports = mongoose.model('Plan', planSchema);