import prisma from '../utils/prisma.js';

export const createReview = async (req, res, next) => {
  try {
    const { resortId, rating, comment } = req.body;
    const userId = req.user.userId;

    if (!resortId || !rating || !comment) {
      return res.status(400).json({ error: 'Resort ID, rating, and comment are required' });
    }

    const ratingVal = parseInt(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    // Check if resort exists
    const resort = await prisma.resort.findUnique({
      where: { id: resortId }
    });
    if (!resort) {
      return res.status(404).json({ error: 'Resort not found' });
    }

    // Use Prisma transaction to create review and update resort aggregates
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the new review
      const review = await tx.review.create({
        data: {
          resortId,
          userId,
          rating: ratingVal,
          comment: comment.trim()
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      // 2. Aggregate all reviews for this resort
      const aggregates = await tx.review.aggregate({
        where: { resortId },
        _avg: { rating: true },
        _count: { id: true }
      });

      const averageRating = parseFloat((aggregates._avg.rating || ratingVal).toFixed(1));
      const totalReviews = aggregates._count.id || 1;

      // 3. Update resort
      await tx.resort.update({
        where: { id: resortId },
        data: {
          rating: averageRating,
          reviewCount: totalReviews
        }
      });

      return review;
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getResortReviews = async (req, res, next) => {
  try {
    const { resortId } = req.params;

    if (!resortId) {
      return res.status(400).json({ error: 'Resort ID is required' });
    }

    const reviews = await prisma.review.findMany({
      where: { resortId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};
