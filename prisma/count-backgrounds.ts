import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.component.count({
    where: { category: 'backgrounds' },
  });
  console.log('Background count:', count);

  const backgrounds = await prisma.component.findMany({
    where: { category: 'backgrounds' },
    select: { slug: true, name: true },
    orderBy: { order: 'asc' },
  });

  console.log('\nBackgrounds in database:');
  backgrounds.forEach((bg, i) =>
    console.log(`${i + 1}. ${bg.name} (${bg.slug})`),
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
