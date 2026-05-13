import express from 'express';
import * as wishlistController from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/security.js';

const router = express.Router();

// Allow toggle
router.post('/toggle', authenticate, wishlistController.toggleWishlist);

// Note: The UI calls /users/:id/wishlist, but we can also have it here
// or mount this router as /wishlist and /users can have its own.
// Let's match the UI expectations.

export default router;
