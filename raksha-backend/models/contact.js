import mongoose from 'mongoose';

const emergencyContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide contact name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact phone number'],
      trim: true,
    },
    relation: {
      type: String,
      required: [true, 'Please specify relation (e.g. Mother, Father, Friend)'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);
export default EmergencyContact;
