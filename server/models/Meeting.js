const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    maxlength: [100, 'Subject cannot be more than 100 characters']
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [240, 'Duration cannot exceed 240 minutes']
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  meetingLink: {
    type: String,
    default: ''
  },
  maxStudents: {
    type: Number,
    default: 10,
    min: [1, 'At least 1 student must be allowed'],
    max: [50, 'Maximum 50 students allowed']
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  }
}, {
  timestamps: true
});

// Index for efficient queries
meetingSchema.index({ teacher: 1, scheduledDate: 1 });
meetingSchema.index({ students: 1, scheduledDate: 1 });
meetingSchema.index({ subject: 1, scheduledDate: 1 });

// Virtual for checking if meeting is full
meetingSchema.virtual('isFull').get(function() {
  return this.students.length >= this.maxStudents;
});

// Virtual for available spots
meetingSchema.virtual('availableSpots').get(function() {
  return this.maxStudents - this.students.length;
});

// Ensure virtuals are included in JSON
meetingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Meeting', meetingSchema);
