import prisma from '../lib/db/prisma';

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Import and run seed files
    console.log('📦 Seeding shared configurations...');
    await import('./seed-shared-configs');

    console.log('📦 Seeding agents...');
    await import('./seed-agents');

    console.log('📦 Seeding workflows...');
    await import('./seed-workflows');

    console.log('✅ Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
