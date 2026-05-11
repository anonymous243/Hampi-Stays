const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const resorts = await prisma.resort.findMany({
    select: {
      name: true,
      images: true
    }
  });
  
  console.log('--- RESORTS IMAGES ---');
  resorts.forEach(r => {
    console.log(`Resort: ${r.name}`);
    console.log(`Images Count: ${r.images?.length || 0}`);
    if (r.images && r.images.length > 0) {
      console.log(`First Image Sample: ${r.images[0].substring(0, 50)}...`);
    }
    console.log('---');
  });
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
