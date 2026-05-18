import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { authenticate } from '../middleware/security.js';

const router = express.Router();

// Public: Get all reviews for a resort
router.get('/resort/:resortId', reviewController.getResortReviews);

// Protected: Submit a new review
router.post('/', authenticate, reviewController.createReview);

export default router;
