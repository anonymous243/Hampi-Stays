import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Starting database cleanup...');

  try {
    // 1. Delete dependent data first
    await prisma.booking.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.review.deleteMany();
    console.log('✅ Deleted bookings, wishlists, and reviews');

    // 2. Delete resorts and rooms
    await prisma.room.deleteMany();
    await prisma.resort.deleteMany();
    console.log('✅ Deleted resorts and rooms');

    // 3. Delete resort owner profiles (except admin's profile if any)
    const admin = await prisma.user.findUnique({ where: { email: 'admin@hampistays.com' } });
    
    await prisma.resortOwner.deleteMany({
      where: {
        NOT: {
          userId: admin?.id || 'none'
        }
      }
    });
    console.log('✅ Deleted resort owner profiles');

    // 4. Delete users except the admin
    await prisma.user.deleteMany({
      where: {
        NOT: {
          email: 'admin@hampistays.com'
        }
      }
    });
    console.log('✅ Deleted all users except Admin');

    console.log('\n✨ Database is now CLEAN and ready for real data! 🚀');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
