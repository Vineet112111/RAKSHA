import mongoose from 'mongoose';

const sosHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sosId: {
      type: String,
      required: true,
      unique: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    latitude: {
      type: Number,
      required: [true, 'Please provide start latitude'],
    },
    longitude: {
      type: Number,
      required: [true, 'Please provide start longitude'],
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'safe'],
      default: 'active',
    },
    cancelled: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const SOSHistory = mongoose.model('SOSHistory', sosHistorySchema);
export default SOSHistory;
