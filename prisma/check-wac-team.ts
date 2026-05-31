import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const team = await prisma.team.findFirst({
  where: { name: 'WAC - Web App Crew' },
  include: {
    members: {
      include: {
        agent: {
          select: {
            name: true,
            role: true,
            maxConcurrentTasks: true
          }
        }
      },
      orderBy: { order: 'asc' }
    },
    workflow: {
      select: {
        name: true
      }
    }
  }
});

if (team) {
  console.log('\n🎯 WAC - Web App Crew Team Created!\n');
  console.log(`Team ID: ${team.id}`);
  console.log(`Workflow: ${team.workflow?.name}\n`);
  console.log('Team Members (in workflow order):');
  console.log('━'.repeat(80));

  team.members.forEach((member, i) => {
    console.log(`${i + 1}. ${member.agent.name}`);
    console.log(`   Role: ${member.workflowRole}`);
    console.log(`   Max Concurrent: ${member.agent.maxConcurrentTasks} tasks`);
    console.log(`   Can Assign: ${member.canAssign ? '✓' : '✗'} | Can Review: ${member.canReview ? '✓' : '✗'}`);
    console.log('');
  });

  const developers = team.members.filter(m =>
    m.agent.role === 'FRONTEND_ENGINEER' || m.agent.role === 'FULLSTACK_ENGINEER'
  );

  console.log('━'.repeat(80));
  console.log(`\n💻 Developer Agents (Can Work in Parallel):`);
  console.log(`   ${developers.map(d => d.agent.name).join(' + ')}`);
  console.log(`   Combined Capacity: ${developers.reduce((sum, d) => sum + d.agent.maxConcurrentTasks, 0)} concurrent tasks\n`);
}

await prisma.$disconnect();
