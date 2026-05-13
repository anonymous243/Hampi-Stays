import express from 'express';
import * as userController from '../controllers/userController.js';
import * as wishlistController from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/security.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.get('/bookings', userController.getBookings);
router.get('/notifications', userController.getNotifications);
router.get('/:id/wishlist', wishlistController.getUserWishlist);
router.get('/:id', userController.getUserById);
router.patch('/:id', userController.updateUserById);

export default router;
