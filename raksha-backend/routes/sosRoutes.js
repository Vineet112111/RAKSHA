import express from 'express';
import {
  triggerSOS,
  cancelSOS,
  imSafeSOS,
  getHistory,
  getActiveSOS,
} from '../controllers/sosController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth protection to all SOS routes
router.use(protect);

router.post('/trigger', triggerSOS);
router.post('/cancel/:sosId', cancelSOS);
router.post('/im-safe/:sosId', imSafeSOS);
router.get('/history', getHistory);
router.get('/active', getActiveSOS);

export default router;
