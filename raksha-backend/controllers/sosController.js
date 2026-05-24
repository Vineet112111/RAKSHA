import crypto from 'crypto';
import { z } from 'zod';
import SOSHistory from '../models/sosHistory.js';
import EmergencyContact from '../models/contact.js';
import User from '../models/user.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';

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
    let sosRecord = await SOSHistory.findOne({
      userId: req.user.id,
      status: 'active',
    });

    let newTriggered = false;

    if (!sosRecord) {
      const sosId = `SOS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      sosRecord = await SOSHistory.create({
        userId: req.user.id,
        sosId,
        latitude,
        longitude,
        status: 'active',
        notes: notes || 'Emergency SOS triggered',
      });
      newTriggered = true;
    }

    console.log(`[SOS ACTIVE] User: ${req.user.name}, ID: ${sosRecord.sosId}`);

    // If new SOS triggered, send Mock WhatsApp alerts to all emergency contacts
    if (newTriggered) {
      try {
        const user = await User.findById(req.user.id);
        const userName = user ? user.name : req.user.name || 'A RAKSHA User';
        
        const contacts = await EmergencyContact.find({ userId: req.user.id });
        const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/track/${sosRecord.sosId}`;
        
        const currentTime = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        const message = `🚨 RAKSHA ALERT - ${userName} needs help!\nLocation: https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}\nLive Track: ${trackingUrl}\nTime: ${currentTime}`;

        if (contacts.length > 0) {
          contacts.forEach(contact => {
            sendWhatsAppMessage(contact.name, contact.phone, message);
          });
        } else {
          console.log(`[MOCK WHATSAPP INFO] No emergency contacts configured for user ${userName} to alert.`);
        }
      } catch (err) {
        console.error('[WHATSAPP DISPATCH ERROR]', err);
      }
    }

    res.status(201).json({
      success: true,
      data: sosRecord,
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

    // Send Mock WhatsApp message to all contacts indicating safety
    try {
      const user = await User.findById(req.user.id);
      const userName = user ? user.name : 'A RAKSHA User';
      const contacts = await EmergencyContact.find({ userId: req.user.id });
      
      const lat = sosRecord.latitude;
      const lng = sosRecord.longitude;
      const message = `✅ ${userName} is now SAFE.\nLast Location: https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}`;

      if (contacts.length > 0) {
        contacts.forEach(contact => {
          sendWhatsAppMessage(contact.name, contact.phone, message);
        });
      }
    } catch (err) {
      console.error('[WHATSAPP SAFE DISPATCH ERROR]', err);
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

// @desc    Get public tracking details for SOS
// @route   GET /api/sos/public-track/:sosId
// @access  Public
export const getPublicSOS = async (req, res) => {
  try {
    const { sosId } = req.params;
    const sosRecord = await SOSHistory.findOne({ sosId }).populate('userId', 'name');

    if (!sosRecord) {
      return res.status(404).json({ success: false, message: 'SOS record not found' });
    }

    res.json({
      success: true,
      data: {
        sosId: sosRecord.sosId,
        latitude: sosRecord.latitude,
        longitude: sosRecord.longitude,
        status: sosRecord.status,
        userName: sosRecord.userId ? sosRecord.userId.name : 'RAKSHA User',
        updatedAt: sosRecord.updatedAt,
      },
    });
  } catch (error) {
    console.error('[GET PUBLIC TRACK ERROR]', error);
    res.status(500).json({ success: false, message: 'Server error fetching public tracking details' });
  }
};
