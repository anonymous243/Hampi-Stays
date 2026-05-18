import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/security.js';

const router = express.Router();

router.post('/', authenticate, bookingController.createBooking);
router.post('/:reference/verify-payment', authenticate, bookingController.verifyBookingPayment);
router.get('/reference/:reference', bookingController.getBookingByReference);

// Management Routes
router.patch('/:id/confirm', authenticate, authorize('ADMIN','RESORT_OWNER','STAFF'), bookingController.confirmBooking);
router.patch('/:id/reject', authenticate, authorize('ADMIN','RESORT_OWNER','STAFF'), bookingController.rejectBooking);
router.patch('/:id/status', authenticate, authorize('ADMIN','RESORT_OWNER','STAFF'), bookingController.updateBookingStatus);
router.post('/:id/welcome-greet', authenticate, authorize('ADMIN','RESORT_OWNER','STAFF'), bookingController.welcomeGreet);

export default router;
