const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  originalText: {
    type: String,
    required: [true, 'Original text is required'],
    maxlength: [50000, 'Original text cannot exceed 50,000 characters']
  },
  summary: {
    type: String,
    required: [true, 'Summary is required'],
    maxlength: [10000, 'Summary cannot exceed 10,000 characters']
  },
  wordCount: {
    original: {
      type: Number,
      required: true,
      min: [1, 'Original text must have at least 1 word']
    },
    summary: {
      type: Number,
      required: true,
      min: [1, 'Summary must have at least 1 word']
    }
  },
  prompt: {
    type: String,
    default: 'Summarize the following text in a clear and concise manner:',
    maxlength: [1000, 'Prompt cannot exceed 1,000 characters']
  },
  aiProvider: {
    type: String,
    enum: ['gemini'],
    default: 'gemini'
  },
  model: {
    type: String,
    default: 'gemini-1.5-flash-latest'
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'completed'
  },
  error: {
    type: String,
    maxlength: [500, 'Error message cannot exceed 500 characters']
  },
  processingTime: {
    type: Number, // in milliseconds
    min: [0, 'Processing time cannot be negative']
  },
  creditsUsed: {
    type: Number,
    default: 1,
    min: [1, 'At least 1 credit must be used']
  }
}, {
  timestamps: true
});

// Index for efficient queries
summarySchema.index({ userId: 1, createdAt: -1 });
summarySchema.index({ status: 1 });

// Virtual for compression ratio
summarySchema.virtual('compressionRatio').get(function() {
  if (this.wordCount.original === 0) return 0;
  return ((this.wordCount.original - this.wordCount.summary) / this.wordCount.original * 100).toFixed(1);
});

// Ensure virtuals are included in JSON output
summarySchema.set('toJSON', { virtuals: true });

// Pre-save middleware to calculate word counts
summarySchema.pre('save', function(next) {
  if (this.isModified('originalText')) {
    this.wordCount.original = this.countWords(this.originalText);
  }
  if (this.isModified('summary')) {
    this.wordCount.summary = this.countWords(this.summary);
  }
  next();
});

// Method to count words
summarySchema.methods.countWords = function(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Static method to get summaries by user with pagination
summarySchema.statics.getByUser = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name email');
};

// Static method to get all summaries for reviewers/admins
summarySchema.statics.getAllForReview = function(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name email');
};

module.exports = mongoose.model('Summary', summarySchema); 