const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedReviews() {
  console.log('🌱 Starting reviews seeding...');

  // 1. Get traveller user
  const traveler = await prisma.user.findFirst({
    where: { role: 'TRAVELLER' }
  });
  if (!traveler) {
    console.error('❌ Traveller user not found in database! Please seed or register a user first.');
    return;
  }

  // 2. Get active resorts
  const resorts = await prisma.resort.findMany({
    where: { status: 'APPROVED' }
  });

  if (resorts.length === 0) {
    console.log('❌ No active resorts found in database!');
    return;
  }

  const sampleReviews = [
    {
      rating: 5,
      comment: "Absolutely breathtaking! The heritage architecture was preserved with such luxury and style. The river view from the deck was magical."
    },
    {
      rating: 5,
      comment: "Stunning experience! The local guides suggested by the resort were incredibly knowledgeable. Highly recommend the breakfast package."
    },
    {
      rating: 4,
      comment: "A serene getaway with pristine service. The pool area is perfect for relaxing after exploring Hampi's ancient ruins."
    }
  ];

  for (const resort of resorts) {
    console.log(`- Seeding reviews for resort: ${resort.name}`);
    
    // Clear existing reviews for this resort first to prevent accumulation
    await prisma.review.deleteMany({
      where: { resortId: resort.id }
    });

    for (let i = 0; i < sampleReviews.length; i++) {
      const reviewData = sampleReviews[i];
      await prisma.review.create({
        data: {
          resortId: resort.id,
          userId: traveler.id,
          rating: reviewData.rating,
          comment: reviewData.comment
        }
      });
    }

    // Update resort aggregate rating to reflect sample reviews (average: 4.7)
    await prisma.resort.update({
      where: { id: resort.id },
      data: {
        rating: 4.7,
        reviewCount: 3
      }
    });
  }

  console.log('✅ Seeding completed! All active resorts now have high-fidelity reviews.');
}

seedReviews()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
