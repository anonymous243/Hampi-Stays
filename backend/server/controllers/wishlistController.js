import prisma from '../utils/prisma.js';

export const toggleWishlist = async (req, res, next) => {
  try {
    const { userId, resortId } = req.body;
    
    if (!userId || !resortId) {
      return res.status(400).json({ error: 'User ID and Resort ID are required' });
    }

    // Check if exists
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_resortId: {
          userId,
          resortId
        }
      }
    });

    if (existing) {
      // Remove
      await prisma.wishlist.delete({
        where: { id: existing.id }
      });
      return res.json({ saved: false, message: 'Removed from wishlist' });
    } else {
      // Add
      await prisma.wishlist.create({
        data: { userId, resortId }
      });
      return res.json({ saved: true, message: 'Added to wishlist' });
    }
  } catch (error) {
    next(error);
  }
};

export const getUserWishlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: id },
      include: {
        resort: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Flatten to just return resorts
    const resorts = wishlist.map(item => item.resort);
    res.json(resorts);
  } catch (error) {
    next(error);
  }
};
