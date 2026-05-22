const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBookings() {
  const bookings = await prisma.booking.findMany({
    include: {
      user: {
        select: {
          email: true,
          name: true
        }
      },
      resort: {
        select: {
          name: true
        }
      }
    }
  });
  
  console.log('--- BOOKINGS ---');
  console.log(JSON.stringify(bookings, null, 2));
}

checkBookings()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
