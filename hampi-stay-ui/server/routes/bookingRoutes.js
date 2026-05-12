import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { authenticate } from '../middleware/security.js';

const router = express.Router();

router.post('/', authenticate, bookingController.createBooking);
router.post('/:reference/verify-payment', authenticate, bookingController.verifyBookingPayment);
router.get('/reference/:reference', bookingController.getBookingByReference);

// Management Routes
router.patch('/:id/confirm', authenticate, bookingController.confirmBooking);
router.patch('/:id/reject', authenticate, bookingController.rejectBooking);
router.patch('/:id/status', authenticate, bookingController.updateBookingStatus);
router.post('/:id/welcome-greet', authenticate, bookingController.welcomeGreet);

export default router;
