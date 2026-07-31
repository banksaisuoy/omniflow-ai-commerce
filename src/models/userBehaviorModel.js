import mongoose from 'mongoose';

const userBehaviorSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  productId: {
    type: String,
    required: true,
    index: true
  },
  interactionType: {
    type: String,
    enum: ['view', 'click', 'add_to_cart', 'purchase', 'like', 'share'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  sessionId: {
    type: String,
    required: false
  }
}, { timestamps: true });

// Index for efficient querying by user and interaction type
userBehaviorSchema.index({ userId: 1, interactionType: 1, timestamp: -1 });
userBehaviorSchema.index({ productId: 1, interactionType: 1 });

export const UserBehavior = mongoose.models.UserBehavior || mongoose.model('UserBehavior', userBehaviorSchema);