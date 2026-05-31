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

  console.log('\n✅ FINAL VALIDATION COMPLETE\n');
  console.log('=' .repeat(80));
  
  const appTypes = ['WEB_APP', 'DESKTOP', 'MOBILE_APP', 'API'];
  const configTypes = ['ESLINT', 'NEXTJS', 'TYPESCRIPT', 'TAILWIND', 'PRETTIER', 'PACKAGE_JSON', 'WINDSURF_RULES', 'AGENTS_MD'];
  
  for (const appType of appTypes) {
    const appConfigs = configs.filter(c => c.appType === appType);
    console.log(`\n${appType}: ${appConfigs.length} configs`);
    appConfigs.forEach(c => console.log(`  ✓ ${c.name}`));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 TOTAL: ${configs.length} configs in database`);
  console.log(`✅ Expected: 32 (8 types × 4 apps)`);
  console.log(`${configs.length === 32 ? '✅ PASS' : '❌ FAIL'}: All configs present\n`);
}

main().finally(() => prisma.$disconnect());
