import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedWACTeam() {
  console.log('🌱 Seeding WAC - Web App Crew team...');

  // Find the required agents
  const taylor = await prisma.agent.findFirst({ where: { name: { contains: 'Taylor' } } });
  const luna = await prisma.agent.findFirst({ where: { name: { contains: 'Luna' } } });
  const alex = await prisma.agent.findFirst({ where: { name: { contains: 'Alex' } } });
  const morgan = await prisma.agent.findFirst({ where: { name: { contains: 'Morgan' } } });
  const jordan = await prisma.agent.findFirst({ where: { name: { contains: 'Jordan' } } });
  const river = await prisma.agent.findFirst({ where: { name: { contains: 'River' } } });

  if (!taylor || !luna || !alex || !morgan || !jordan || !river) {
    console.error('❌ Required agents not found. Please run seed-agents.ts first.');
    return;
  }

  // Find the Web App Development workflow
  const workflow = await prisma.workflow.findFirst({
    where: { name: 'Web App Development', isDefault: true },
  });

  if (!workflow) {
    console.error('❌ Web App Development workflow not found. Please run seed-workflows.ts first.');
    return;
  }

  // Check if team already exists
  const existingTeam = await prisma.team.findFirst({
    where: { name: 'WAC - Web App Crew' },
  });

  if (existingTeam) {
    console.log('⚠️  WAC team already exists, skipping...');
    return;
  }

  // Create the team with workflow reference
  const team = await prisma.team.create({
    data: {
      name: 'WAC - Web App Crew',
      description:
        'Specialized team for building modern Next.js 16+ and React 19+ web applications following best practices with Tailwind CSS, server actions, and advanced caching strategies.',
      workflowId: workflow.id,
      members: {
        create: [
          {
            agentId: taylor.id,
            workflowRole: 'Requirements Analysis',
            order: 0,
            canAssign: true,
            canReview: false,
          },
          {
            agentId: luna.id,
            workflowRole: 'UI/UX Design',
            order: 1,
            canAssign: false,
            canReview: true,
          },
          {
            agentId: river.id,
            workflowRole: 'Technical Review & Architecture',
            order: 2,
            canAssign: true,
            canReview: true,
          },
          {
            agentId: alex.id,
            workflowRole: 'Frontend Development',
            order: 3,
            canAssign: false,
            canReview: true,
          },
          {
            agentId: morgan.id,
            workflowRole: 'Fullstack Development',
            order: 4,
            canAssign: false,
            canReview: true,
          },
          {
            agentId: jordan.id,
            workflowRole: 'QA Testing',
            order: 5,
            canAssign: false,
            canReview: true,
          },
        ],
      },
    },
    include: {
      members: {
        include: {
          agent: true,
        },
      },
      workflow: true,
    },
  });

  console.log('✅ Created WAC - Web App Crew team with specialized workflow');
  console.log(`   Team ID: ${team.id}`);
  console.log(`   Members: ${team.members.length}`);
  console.log(`   Workflow: ${team.workflow?.name}`);
  console.log('   Workflow stages: Requirements → Design → Tech Review → Development → Code Review → QA → Deploy');

  console.log('✨ WAC team seeded successfully!');
}

seedWACTeam()
  .catch((e) => {
    console.error('❌ Error seeding WAC team:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
