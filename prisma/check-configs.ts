import { PrismaClient, AppType, ConfigType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const appTypes = Object.values(AppType);
  const configTypes = Object.values(ConfigType);

  console.log('📊 Config Coverage Report\n');
  console.log('=' .repeat(80));

  for (const appType of appTypes) {
    const configs = await prisma.configTemplate.findMany({
      where: { appType, isActive: true },
      select: { configType: true, name: true }
    });

    console.log(`\n${appType} (${configs.length} configs):`);
    if (configs.length === 0) {
      console.log('  ❌ NO CONFIGS FOUND!');
    } else {
      configs.forEach(c => console.log(`  ✓ ${c.configType}: ${c.name}`));
    }
  }

  // Check globals
  const globals = await prisma.configTemplate.findMany({
    where: { appType: null, isActive: true },
    select: { configType: true, name: true }
  });
  console.log(`\nGLOBAL (${globals.length} configs):`);
  globals.forEach(c => console.log(`  ✓ ${c.configType}: ${c.name}`));

  console.log('\n' + '='.repeat(80));
  const total = await prisma.configTemplate.count({ where: { isActive: true } });
  console.log(`\n📊 TOTAL ACTIVE CONFIGS: ${total}`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
