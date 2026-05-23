import crypto from 'crypto';
import { z } from 'zod';
import SOSHistory from '../models/sosHistory.js';

const triggerSOSSchema = z.object({
  latitude: z.number({ required_error: 'Latitude is required' }),
  longitude: z.number({ required_error: 'Longitude is required' }),
  notes: z.string().optional(),
});

// @desc    Trigger SOS alert
// @route   POST /api/sos/trigger
// @access  Private
export const triggerSOS = async (req, res) => {
  try {
    const validatedData = triggerSOSSchema.parse(req.body);
    const { latitude, longitude, notes } = validatedData;

    // Check if there is already an active SOS for this user
    const existingActiveSOS = await SOSHistory.findOne({
      userId: req.user.id,
      status: 'active',
    });

    if (existingActiveSOS) {
      return res.status(200).json({
        success: true,
        message: 'Active SOS already exists',
        data: existingActiveSOS,
      });
    }

    const sosId = `SOS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const newSOS = await SOSHistory.create({
      userId: req.user.id,
      sosId,
      latitude,
      longitude,
      status: 'active',
      notes: notes || 'Emergency SOS triggered',
    });

    console.log(`[SOS TRIGGERED] User: ${req.user.name}, ID: ${sosId}`);

    res.status(201).json({
      success: true,
      data: newSOS,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMsg = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ success: false, message: errorMsg });
    }
    console.error('[SOS TRIGGER ERROR]', error);
    res.status(500).json({ success: false, message: 'Server error triggering SOS' });
  }
};

// @desc    Cancel SOS alert
// @route   POST /api/sos/cancel/:sosId
// @access  Private
export const cancelSOS = async (req, res) => {
  try {
    const { sosId } = req.params;
    const sosRecord = await SOSHistory.findOne({ sosId });

    if (!sosRecord) {
      return res.status(404).json({ success: false, message: 'SOS record not found' });
    }

    if (sosRecord.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to modify this SOS record' });
    }

    sosRecord.status = 'cancelled';
    sosRecord.cancelled = true;
    await sosRecord.save();

    // Notify connected sockets in the room that the SOS has ended
    const io = req.app.get('socketio');
    if (io) {
      io.to(`sos-${sosId}`).emit('sos-ended', { sosId, status: 'cancelled' });
      console.log(`[SOS CANCELLED EVENT EMITTED] Room: sos-${sosId}`);
    }

    res.json({
      success: true,
      message: 'SOS cancelled successfully',
      data: sosRecord,
    });
  } catch (error) {
    console.error('[SOS CANCEL ERROR]', error);
    res.status(500).json({ success: false, message: 'Server error cancelling SOS' });
  }
};

// @desc    Mark SOS as "I'm Safe"
// @route   POST /api/sos/im-safe/:sosId
// @access  Private
export const imSafeSOS = async (req, res) => {
  try {
    const { sosId } = req.params;
    const sosRecord = await SOSHistory.findOne({ sosId });

    if (!sosRecord) {
      return res.status(404).json({ success: false, message: 'SOS record not found' });
    }

    if (sosRecord.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to modify this SOS record' });
    }

    sosRecord.status = 'safe';
    await sosRecord.save();

    // Notify connected sockets in the room that the SOS has ended safely
    const io = req.app.get('socketio');
    if (io) {
      io.to(`sos-${sosId}`).emit('sos-ended', { sosId, status: 'safe' });
      console.log(`[SOS SAFE EVENT EMITTED] Room: sos-${sosId}`);
    }

    res.json({
      success: true,
      message: 'Status updated to SAFE successfully',
      data: sosRecord,
    });
  } catch (error) {
    console.error('[SOS SAFE ERROR]', error);
    res.status(500).json({ success: false, message: 'Server error updating safe status' });
  }
};

// @desc    Get SOS history
// @route   GET /api/sos/history
// @access  Private
export const getHistory = async (req, res) => {
  try {
    const history = await SOSHistory.find({ userId: req.user.id }).sort({ timestamp: -1 });
    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('[GET SOS HISTORY ERROR]', error);
    res.status(500).json({ success: false, message: 'Server error fetching SOS history' });
  }
};

// @desc    Get current active SOS for user
// @route   GET /api/sos/active
// @access  Private
export const getActiveSOS = async (req, res) => {
  try {
    const activeSOS = await SOSHistory.findOne({
      userId: req.user.id,
      status: 'active',
    });

    res.json({
      success: true,
      data: activeSOS || null,
    });
  } catch (error) {
    console.error('[GET ACTIVE SOS ERROR]', error);
    res.status(500).json({ success: false, message: 'Server error fetching active SOS' });
  }
};
