import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const resorts = await prisma.resort.findMany({
      take: 5,
      select: { name: true, images: true, status: true, isFeatured: true }
    });
    console.log(JSON.stringify(resorts, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
