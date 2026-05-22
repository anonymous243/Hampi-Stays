import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function migrate() {
  console.log('🚀 Running raw SQL migration on cloud database table "resorts"...');
  try {
    // 1. Get indexes for "resorts" to see if there is any index on "category"
    const indexes = await prisma.$queryRawUnsafe(
      `SELECT indexname FROM pg_indexes WHERE tablename = 'resorts';`
    );
    console.log('Current indexes on "resorts":', indexes);

    // 2. Add categories column if not exists
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "resorts" ADD COLUMN IF NOT EXISTS "categories" text[] NOT NULL DEFAULT '{}';`
    );
    console.log('✅ Added "categories" column to "resorts" table');

    // 3. Drop index on category if it exists
    const categoryIndex = indexes.find(idx => idx.indexname.includes('category'));
    if (categoryIndex) {
      await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "${categoryIndex.indexname}";`);
      console.log(`✅ Dropped old category index: ${categoryIndex.indexname}`);
    } else {
      console.log('ℹ️ No category index found to drop');
    }

    // 4. Populate categories array from the old single-select category column for existing resorts
    await prisma.$executeRawUnsafe(
      `UPDATE "resorts" 
       SET "categories" = ARRAY["category"] 
       WHERE "category" IS NOT NULL 
         AND "category" != '' 
         AND (cardinality("categories") = 0 OR "categories" IS NULL);`
    );
    console.log('✅ Migrated old "category" values to "categories" array');

    // Verify by fetching a resort
    const resort = await prisma.resort.findFirst();
    console.log('Migration verification - Resort record:', {
      id: resort.id,
      name: resort.name,
      categories: resort.categories,
      category: resort.category
    });
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
