import express from 'express';
import {
  triggerSOS,
  cancelSOS,
  imSafeSOS,
  getHistory,
  getActiveSOS,
  getPublicSOS,
} from '../controllers/sosController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route for real-time tracking (no authentication required)
router.get('/public-track/:sosId', getPublicSOS);

// Apply auth protection to all subsequent SOS routes
router.use(protect);

router.post('/trigger', triggerSOS);
router.post('/cancel/:sosId', cancelSOS);
router.post('/im-safe/:sosId', imSafeSOS);
router.get('/history', getHistory);
router.get('/active', getActiveSOS);

export default router;
