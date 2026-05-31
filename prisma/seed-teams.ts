import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTeams() {
  console.log('🌱 Seeding default teams...');

  // Get all agents and workflows
  const agents = await prisma.agent.findMany();
  const workflows = await prisma.workflow.findMany();

  const agentMap = Object.fromEntries(agents.map(a => [a.name.split(' - ')[0], a]));
  const workflowMap = Object.fromEntries(workflows.map(w => [w.name, w]));

  // 1. Next.js Web App Team - Full frontend team with design
  let nextjsTeam = await prisma.team.findFirst({
    where: { name: 'Next.js Web App Team' },
  });
  
  if (!nextjsTeam) {
    nextjsTeam = await prisma.team.create({
      data: {
        name: 'Next.js Web App Team',
        description: 'Complete team for building modern Next.js web applications with design-first approach',
        workflowId: workflowMap['Web App Development']?.id,
        isActive: true,
      },
    });
  }

  // Add members to Next.js team
  const nextjsMembers = [
    { agent: 'Taylor', role: 'PRODUCT_OWNER', order: 1 },
    { agent: 'Luna', role: 'DESIGNER', order: 2 },
    { agent: 'River', role: 'TECH_LEAD', order: 3 },
    { agent: 'Alex', role: 'FRONTEND_ENGINEER', order: 4 },
    { agent: 'Jordan', role: 'QA_ENGINEER', order: 5 },
  ];

  for (const member of nextjsMembers) {
    const agent = agentMap[member.agent];
    if (agent) {
      await prisma.teamMember.upsert({
        where: {
          teamId_agentId: {
            teamId: nextjsTeam.id,
            agentId: agent.id,
          },
        },
        update: {
          workflowRole: member.role,
          order: member.order,
        },
        create: {
          teamId: nextjsTeam.id,
          agentId: agent.id,
          workflowRole: member.role,
          order: member.order,
          canReview: member.role === 'TECH_LEAD',
          canAssign: member.role === 'TECH_LEAD' || member.role === 'PRODUCT_OWNER',
        },
      });
    }
  }
  console.log('✅ Created team: Next.js Web App Team');

  // 2. Fullstack Development Team - End-to-end with backend
  let fullstackTeam = await prisma.team.findFirst({
    where: { name: 'Fullstack Development Team' },
  });
  
  if (!fullstackTeam) {
    fullstackTeam = await prisma.team.create({
      data: {
        name: 'Fullstack Development Team',
        description: 'Complete fullstack team for building APIs, databases, and frontend',
        workflowId: workflowMap['Fullstack Development']?.id || workflowMap['Web App Development']?.id,
        isActive: true,
      },
    });
  }

  const fullstackMembers = [
    { agent: 'Taylor', role: 'PRODUCT_OWNER', order: 1 },
    { agent: 'River', role: 'TECH_LEAD', order: 2 },
    { agent: 'Morgan', role: 'FULLSTACK_ENGINEER', order: 3 },
    { agent: 'Alex', role: 'FRONTEND_ENGINEER', order: 4 },
    { agent: 'Jordan', role: 'QA_ENGINEER', order: 5 },
    { agent: 'Sam', role: 'DEVOPS_ENGINEER', order: 6 },
  ];

  for (const member of fullstackMembers) {
    const agent = agentMap[member.agent];
    if (agent) {
      await prisma.teamMember.upsert({
        where: {
          teamId_agentId: {
            teamId: fullstackTeam.id,
            agentId: agent.id,
          },
        },
        update: {
          workflowRole: member.role,
          order: member.order,
        },
        create: {
          teamId: fullstackTeam.id,
          agentId: agent.id,
          workflowRole: member.role,
          order: member.order,
          canReview: member.role === 'TECH_LEAD',
          canAssign: member.role === 'TECH_LEAD' || member.role === 'PRODUCT_OWNER',
        },
      });
    }
  }
  console.log('✅ Created team: Fullstack Development Team');

  // 3. Rapid Prototyping Team - Lean team for MVPs
  let prototypeTeam = await prisma.team.findFirst({
    where: { name: 'Rapid Prototyping Team' },
  });
  
  if (!prototypeTeam) {
    prototypeTeam = await prisma.team.create({
      data: {
        name: 'Rapid Prototyping Team',
        description: 'Lean agile team for quick MVPs and prototypes',
        workflowId: workflowMap['Agile Sprint']?.id || workflowMap['Web App Development']?.id,
        isActive: true,
      },
    });
  }

  const prototypeMembers = [
    { agent: 'Taylor', role: 'PRODUCT_OWNER', order: 1 },
    { agent: 'Morgan', role: 'FULLSTACK_ENGINEER', order: 2 },
    { agent: 'Alex', role: 'FRONTEND_ENGINEER', order: 3 },
  ];

  for (const member of prototypeMembers) {
    const agent = agentMap[member.agent];
    if (agent) {
      await prisma.teamMember.upsert({
        where: {
          teamId_agentId: {
            teamId: prototypeTeam.id,
            agentId: agent.id,
          },
        },
        update: {
          workflowRole: member.role,
          order: member.order,
        },
        create: {
          teamId: prototypeTeam.id,
          agentId: agent.id,
          workflowRole: member.role,
          order: member.order,
          canReview: member.role === 'FULLSTACK_ENGINEER',
          canAssign: member.role === 'PRODUCT_OWNER',
        },
      });
    }
  }
  console.log('✅ Created team: Rapid Prototyping Team');

  // 4. Design-First Team - UX-focused with frontend
  let designTeam = await prisma.team.findFirst({
    where: { name: 'Design-First Team' },
  });
  
  if (!designTeam) {
    designTeam = await prisma.team.create({
      data: {
        name: 'Design-First Team',
        description: 'UX-focused team prioritizing design excellence and user experience',
        workflowId: workflowMap['Design-Driven Development']?.id || workflowMap['Web App Development']?.id,
        isActive: true,
      },
    });
  }

  const designMembers = [
    { agent: 'Taylor', role: 'PRODUCT_OWNER', order: 1 },
    { agent: 'Luna', role: 'DESIGNER', order: 2 },
    { agent: 'Alex', role: 'FRONTEND_ENGINEER', order: 3 },
    { agent: 'Jordan', role: 'QA_ENGINEER', order: 4 },
  ];

  for (const member of designMembers) {
    const agent = agentMap[member.agent];
    if (agent) {
      await prisma.teamMember.upsert({
        where: {
          teamId_agentId: {
            teamId: designTeam.id,
            agentId: agent.id,
          },
        },
        update: {
          workflowRole: member.role,
          order: member.order,
        },
        create: {
          teamId: designTeam.id,
          agentId: agent.id,
          workflowRole: member.role,
          order: member.order,
          canReview: member.role === 'DESIGNER',
          canAssign: member.role === 'PRODUCT_OWNER',
        },
      });
    }
  }
  console.log('✅ Created team: Design-First Team');

  // 5. Enterprise Team - Full team with DevOps and Scrum
  let enterpriseTeam = await prisma.team.findFirst({
    where: { name: 'Enterprise Team' },
  });
  
  if (!enterpriseTeam) {
    enterpriseTeam = await prisma.team.create({
      data: {
        name: 'Enterprise Team',
        description: 'Complete enterprise team with DevOps, QA, and Scrum practices',
        workflowId: workflowMap['Enterprise Development']?.id || workflowMap['Web App Development']?.id,
        isActive: true,
      },
    });
  }

  const enterpriseMembers = [
    { agent: 'Casey', role: 'SCRUM_MASTER', order: 1 },
    { agent: 'Taylor', role: 'PRODUCT_OWNER', order: 2 },
    { agent: 'Luna', role: 'DESIGNER', order: 3 },
    { agent: 'River', role: 'TECH_LEAD', order: 4 },
    { agent: 'Morgan', role: 'FULLSTACK_ENGINEER', order: 5 },
    { agent: 'Alex', role: 'FRONTEND_ENGINEER', order: 6 },
    { agent: 'Jordan', role: 'QA_ENGINEER', order: 7 },
    { agent: 'Sam', role: 'DEVOPS_ENGINEER', order: 8 },
  ];

  for (const member of enterpriseMembers) {
    const agent = agentMap[member.agent];
    if (agent) {
      await prisma.teamMember.upsert({
        where: {
          teamId_agentId: {
            teamId: enterpriseTeam.id,
            agentId: agent.id,
          },
        },
        update: {
          workflowRole: member.role,
          order: member.order,
        },
        create: {
          teamId: enterpriseTeam.id,
          agentId: agent.id,
          workflowRole: member.role,
          order: member.order,
          canReview: ['TECH_LEAD', 'SCRUM_MASTER'].includes(member.role),
          canAssign: ['TECH_LEAD', 'PRODUCT_OWNER', 'SCRUM_MASTER'].includes(member.role),
        },
      });
    }
  }
  console.log('✅ Created team: Enterprise Team');

  console.log('✨ Default teams seeded successfully!');
}

seedTeams()
  .catch((e) => {
    console.error('❌ Error seeding teams:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default seedTeams;
