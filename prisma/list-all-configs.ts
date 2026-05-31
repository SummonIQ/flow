import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const configs = await prisma.configTemplate.findMany({
    where: { isActive: true },
    select: {
      appType: true,
      configType: true,
      name: true,
    },
    orderBy: [
      { appType: 'asc' },
      { configType: 'asc' },
    ],
  });

  console.log(`\n📋 ALL ${configs.length} CONFIGS IN DATABASE:\n`);
  console.log('='.repeat(100));
  
  let currentAppType = '';
  configs.forEach((c) => {
    const appType = c.appType || 'GLOBAL';
    if (appType !== currentAppType) {
      console.log(`\n${appType}:`);
      currentAppType = appType;
    }
    console.log(`  ✓ ${c.configType.padEnd(20)} ${c.name}`);
  });
  
  console.log('\n' + '='.repeat(100));
  console.log(`\n📊 TOTAL: ${configs.length} configs`);
}

main().finally(() => prisma.$disconnect());
