import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function check() {
  try {
    const tables = await prisma.$queryRawUnsafe(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
    );
    console.log('Tables in database:', tables);
  } catch (err) {
    console.error('Error querying tables:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
