import prisma from '../lib/db/prisma';

async function seedWorkflows() {
  console.log('🌱 Seeding default workflows...');

  // Check if workflows already exist
  const existingWorkflows = await prisma.workflow.count();
  if (existingWorkflows > 0) {
    console.log('⚠️  Workflows already exist, skipping...');
    return;
  }

  // 1. Web App Development Workflow
  const webAppWorkflow = await prisma.workflow.create({
    data: {
      name: 'Web App Development',
      description:
        'Standard workflow for building modern web applications with Next.js and React',
      isDefault: true,
      stages: [
        {
          id: 'requirements',
          name: 'Requirements Analysis',
          description: 'PO analyzes requirements and creates user stories',
          agentRole: 'PRODUCT_OWNER',
        },
        {
          id: 'design',
          name: 'UI/UX Design',
          description: 'Designer creates mockups and design system',
          agentRole: 'DESIGNER',
        },
        {
          id: 'tech-review',
          name: 'Technical Review',
          description:
            'Tech Lead reviews requirements and breaks down into tasks',
          agentRole: 'TECH_LEAD',
        },
        {
          id: 'development',
          name: 'Development',
          description: 'Developers implement features using Next.js and React',
          agentRole: 'FRONTEND_ENGINEER',
        },
        {
          id: 'code-review',
          name: 'Code Review',
          description: 'Tech Lead reviews code quality and architecture',
          agentRole: 'TECH_LEAD',
        },
        {
          id: 'qa-testing',
          name: 'QA Testing',
          description: 'QA Engineer performs comprehensive testing',
          agentRole: 'QA_ENGINEER',
        },
        {
          id: 'deployment',
          name: 'Review & Deploy',
          description: 'Final review and deployment to production',
          agentRole: 'TECH_LEAD',
        },
      ],
      transitions: [
        {
          from: 'requirements',
          to: 'design',
          condition: 'Requirements approved',
        },
        { from: 'design', to: 'tech-review', condition: 'Design approved' },
        { from: 'tech-review', to: 'development', condition: 'Tasks created' },
        {
          from: 'development',
          to: 'code-review',
          condition: 'Feature complete',
        },
        {
          from: 'code-review',
          to: 'development',
          condition: 'Changes requested',
          type: 'feedback',
        },
        { from: 'code-review', to: 'qa-testing', condition: 'Code approved' },
        {
          from: 'qa-testing',
          to: 'development',
          condition: 'Bugs found',
          type: 'feedback',
        },
        { from: 'qa-testing', to: 'deployment', condition: 'Tests passed' },
      ],
      specializations: [
        'Next.js 16+ App Router',
        'React 19+ Server Components',
        'Server Actions & Mutations',
        'TypeScript strict mode',
        'Tailwind CSS v4',
        'shadcn/ui components',
        'Prisma ORM',
        'Zod validation',
      ],
    },
  });

  // 2. Agile Sprint Workflow
  const agileWorkflow = await prisma.workflow.create({
    data: {
      name: 'Agile Sprint',
      description: 'Fast-paced agile workflow for iterative development',
      isDefault: true,
      stages: [
        {
          id: 'backlog',
          name: 'Backlog Refinement',
          description: 'Prioritize and refine user stories',
          agentRole: 'PRODUCT_OWNER',
        },
        {
          id: 'sprint-planning',
          name: 'Sprint Planning',
          description: 'Plan sprint tasks and assignments',
          agentRole: 'TECH_LEAD',
        },
        {
          id: 'development',
          name: 'Development',
          description: 'Implement features in 2-week sprint',
          agentRole: 'FULLSTACK_ENGINEER',
        },
        {
          id: 'testing',
          name: 'Testing',
          description: 'Continuous testing during sprint',
          agentRole: 'QA_ENGINEER',
        },
        {
          id: 'sprint-review',
          name: 'Sprint Review',
          description: 'Demo and review completed work',
          agentRole: 'PRODUCT_OWNER',
        },
        {
          id: 'retrospective',
          name: 'Sprint Retrospective',
          description: 'Reflect and improve processes',
          agentRole: 'SCRUM_MASTER',
        },
      ],
      transitions: [
        { from: 'backlog', to: 'sprint-planning', condition: 'Stories ready' },
        {
          from: 'sprint-planning',
          to: 'development',
          condition: 'Sprint started',
        },
        { from: 'development', to: 'testing', condition: 'Feature complete' },
        {
          from: 'testing',
          to: 'development',
          condition: 'Bugs found',
          type: 'feedback',
        },
        { from: 'testing', to: 'sprint-review', condition: 'All tests passed' },
        {
          from: 'sprint-review',
          to: 'retrospective',
          condition: 'Review complete',
        },
        {
          from: 'retrospective',
          to: 'backlog',
          condition: 'Next sprint',
          type: 'feedback',
        },
      ],
      specializations: [
        'Agile methodology',
        'Scrum framework',
        'Sprint planning',
        'Daily standups',
        'Sprint retrospectives',
      ],
    },
  });

  // 3. API Development Workflow
  const apiWorkflow = await prisma.workflow.create({
    data: {
      name: 'API Development',
      description: 'Workflow for building robust REST or GraphQL APIs',
      isDefault: true,
      stages: [
        {
          id: 'api-design',
          name: 'API Design',
          description: 'Design API endpoints and data models',
          agentRole: 'TECH_LEAD',
        },
        {
          id: 'schema-design',
          name: 'Database Schema',
          description: 'Design database schema and migrations',
          agentRole: 'BACKEND_ENGINEER',
        },
        {
          id: 'implementation',
          name: 'Implementation',
          description: 'Implement API endpoints and business logic',
          agentRole: 'BACKEND_ENGINEER',
        },
        {
          id: 'documentation',
          name: 'Documentation',
          description: 'Write API documentation and examples',
          agentRole: 'TECH_LEAD',
        },
        {
          id: 'testing',
          name: 'Testing',
          description: 'Integration and unit testing',
          agentRole: 'QA_ENGINEER',
        },
        {
          id: 'deployment',
          name: 'Deployment',
          description: 'Deploy to staging and production',
          agentRole: 'DEVOPS_ENGINEER',
        },
      ],
      transitions: [
        {
          from: 'api-design',
          to: 'schema-design',
          condition: 'Design approved',
        },
        {
          from: 'schema-design',
          to: 'implementation',
          condition: 'Schema ready',
        },
        {
          from: 'implementation',
          to: 'documentation',
          condition: 'API complete',
        },
        { from: 'documentation', to: 'testing', condition: 'Docs ready' },
        {
          from: 'testing',
          to: 'implementation',
          condition: 'Issues found',
          type: 'feedback',
        },
        { from: 'testing', to: 'deployment', condition: 'All tests passed' },
      ],
      specializations: [
        'REST API design',
        'GraphQL',
        'OpenAPI/Swagger',
        'API authentication',
        'Rate limiting',
        'Database optimization',
      ],
    },
  });

  // 4. UI/UX Focus Workflow
  const uiWorkflow = await prisma.workflow.create({
    data: {
      name: 'UI/UX Focus',
      description: 'Design-first workflow for interface-heavy projects',
      isDefault: true,
      stages: [
        {
          id: 'research',
          name: 'User Research',
          description: 'Research user needs and behaviors',
          agentRole: 'DESIGNER',
        },
        {
          id: 'wireframes',
          name: 'Wireframing',
          description: 'Create low-fidelity wireframes',
          agentRole: 'DESIGNER',
        },
        {
          id: 'mockups',
          name: 'High-Fidelity Mockups',
          description: 'Design detailed mockups and prototypes',
          agentRole: 'DESIGNER',
        },
        {
          id: 'review',
          name: 'Design Review',
          description: 'Review and approve designs',
          agentRole: 'PRODUCT_OWNER',
        },
        {
          id: 'implementation',
          name: 'UI Implementation',
          description: 'Implement designs with React components',
          agentRole: 'FRONTEND_ENGINEER',
        },
        {
          id: 'usability-testing',
          name: 'Usability Testing',
          description: 'Test user experience and accessibility',
          agentRole: 'QA_ENGINEER',
        },
      ],
      transitions: [
        { from: 'research', to: 'wireframes', condition: 'Research complete' },
        { from: 'wireframes', to: 'mockups', condition: 'Wireframes approved' },
        { from: 'mockups', to: 'review', condition: 'Mockups ready' },
        {
          from: 'review',
          to: 'mockups',
          condition: 'Changes requested',
          type: 'feedback',
        },
        { from: 'review', to: 'implementation', condition: 'Design approved' },
        {
          from: 'implementation',
          to: 'usability-testing',
          condition: 'UI complete',
        },
        {
          from: 'usability-testing',
          to: 'implementation',
          condition: 'Issues found',
          type: 'feedback',
        },
      ],
      specializations: [
        'User research',
        'Wireframing',
        'Prototyping',
        'Design systems',
        'Accessibility (WCAG)',
        'Responsive design',
      ],
    },
  });

  // 5. Fast Paced Iterative Kanban Workflow
  const kanbanWorkflow = await prisma.workflow.create({
    data: {
      name: 'Fast Paced Iterative Kanban',
      description:
        'AI-powered kanban workflow with intelligent agents handling requirements, design, development, and QA',
      isDefault: true,
      stages: [
        {
          id: 'backlog',
          name: 'Backlog',
          description:
            'Tickets are created here. PO automatically analyzes and adds business requirements',
          agentRole: 'PRODUCT_OWNER',
          automationRules: {
            onTicketCreated: {
              action: 'auto-assign-po',
              behavior:
                'PO analyzes ticket, creates business requirements, adds ROI notes, creates knowledge base documentation',
            },
            onCommentWithRequest: {
              action: 'assign-to-po',
              behavior: 'PO makes requested changes and responds via comment',
            },
          },
        },
        {
          id: 'design',
          name: 'Design',
          description:
            'Designer creates beautiful, modern Figma designs for frontend features',
          agentRole: 'DESIGNER',
          automationRules: {
            onTicketEntered: {
              action: 'auto-assign-designer',
              condition: 'isFrontend === true',
              behavior:
                'Designer examines requirements and creates/updates Figma designs using MCP',
            },
          },
          applicability: 'frontend-only',
        },
        {
          id: 'unrefined',
          name: 'Unrefined',
          description:
            'Tech Lead validates requirements and breaks down story into checklist',
          agentRole: 'TECH_LEAD',
          automationRules: {
            onTicketEntered: {
              action: 'auto-assign-tech-lead',
              behavior:
                'Tech Lead reviews requirements, asks clarifying questions, breaks story into checklist items',
            },
            onUserConfirmation: {
              action: 'ready-for-development',
              behavior: 'Tech Lead moves ticket to Ready after confirmation',
            },
          },
        },
        {
          id: 'ready',
          name: 'Ready',
          description: 'Tickets ready for developers to pick up',
          agentRole: null,
          automationRules: {
            poolBehavior: 'available-developer-picks-up',
            description:
              'Any available developer can self-assign and move to In Progress',
          },
        },
        {
          id: 'in-progress',
          name: 'In Progress',
          description:
            'Developer implements feature according to acceptance criteria',
          agentRole: 'FULLSTACK_ENGINEER',
          automationRules: {
            onTicketEntered: {
              behavior:
                'Developer self-assigns, implements per AC, does not add extra features',
            },
            onCompletion: {
              action: 'move-to-qa',
              behavior: 'Developer moves to QA when implementation complete',
            },
          },
        },
        {
          id: 'qa',
          name: 'QA',
          description: 'QA Engineer writes and runs comprehensive tests',
          agentRole: 'QA_ENGINEER',
          automationRules: {
            onTicketEntered: {
              action: 'auto-assign-qa',
              behavior:
                'QA Engineer writes unit, functional, and E2E tests using Vitest, react-testing-library, and Playwright',
            },
            onTestsPass: {
              action: 'move-to-review',
              condition: 'all-tests-pass && no-bugs && no-regressions',
              behavior:
                'QA Engineer moves to In Review when validation complete',
            },
            onTestsFail: {
              action: 'return-to-development',
              condition: 'bugs-found || regressions-detected',
              behavior:
                'QA Engineer returns to developer with detailed bug report',
            },
          },
        },
        {
          id: 'in-review',
          name: 'In Review',
          description: 'Product Owner reviews completed work',
          agentRole: 'PRODUCT_OWNER',
          automationRules: {
            onTicketEntered: {
              action: 'auto-assign-po',
              behavior:
                'PO validates work meets business requirements and acceptance criteria',
            },
            onApproval: {
              action: 'move-to-done',
              behavior: 'PO moves to Done when work is complete',
            },
            onRejection: {
              action: 'return-with-feedback',
              behavior: 'PO returns to appropriate stage with feedback',
            },
          },
        },
        {
          id: 'done',
          name: 'Done',
          description: 'Work completed and approved',
          agentRole: null,
        },
      ],
      transitions: [
        {
          from: 'backlog',
          to: 'design',
          condition: 'isFrontend && requirements complete',
          automatedBy: 'user',
        },
        {
          from: 'backlog',
          to: 'unrefined',
          condition: '!isFrontend && requirements complete',
          automatedBy: 'user',
        },
        {
          from: 'design',
          to: 'unrefined',
          condition: 'Design approved',
          automatedBy: 'user',
        },
        {
          from: 'unrefined',
          to: 'ready',
          condition: 'Checklist created and confirmed',
          automatedBy: 'user',
        },
        {
          from: 'ready',
          to: 'in-progress',
          condition: 'Developer self-assigns',
          automatedBy: 'agent',
        },
        {
          from: 'in-progress',
          to: 'qa',
          condition: 'Development complete',
          automatedBy: 'agent',
        },
        {
          from: 'qa',
          to: 'in-progress',
          condition: 'Bugs found',
          type: 'feedback',
          automatedBy: 'agent',
        },
        {
          from: 'qa',
          to: 'in-review',
          condition: 'All tests passed',
          automatedBy: 'agent',
        },
        {
          from: 'in-review',
          to: 'in-progress',
          condition: 'Changes requested',
          type: 'feedback',
          automatedBy: 'agent',
        },
        {
          from: 'in-review',
          to: 'done',
          condition: 'Work approved',
          automatedBy: 'agent',
        },
      ],
      specializations: [
        'Automated agent workflows',
        'AI-powered requirements analysis',
        'Figma design integration (MCP)',
        'Test automation (Vitest, Playwright)',
        'Agent memory and learning',
        'Knowledge base documentation',
        'ROI tracking',
        'Self-organizing teams',
      ],
    },
  });

  console.log('✅ Created 5 default workflows:');
  console.log(`   1. ${webAppWorkflow.name} (ID: ${webAppWorkflow.id})`);
  console.log(`   2. ${agileWorkflow.name} (ID: ${agileWorkflow.id})`);
  console.log(`   3. ${apiWorkflow.name} (ID: ${apiWorkflow.id})`);
  console.log(`   4. ${uiWorkflow.name} (ID: ${uiWorkflow.id})`);
  console.log(`   5. ${kanbanWorkflow.name} (ID: ${kanbanWorkflow.id})`);
  console.log('✨ Workflows seeded successfully!');
}

seedWorkflows()
  .catch(e => {
    console.error('❌ Error seeding workflows:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
