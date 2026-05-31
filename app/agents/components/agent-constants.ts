export const focusAreas = [
  { value: 'FRONTEND', label: 'Frontend', description: 'UI/UX implementation and client-side development' },
  { value: 'BACKEND', label: 'Backend', description: 'Server-side logic, APIs, and data management' },
  { value: 'QA', label: 'Quality Assurance', description: 'Testing, quality control, and bug prevention' },
  { value: 'PRODUCT_MANAGEMENT', label: 'Product Management', description: 'Strategy, requirements, and product vision' },
  { value: 'DESIGN', label: 'Design', description: 'UI/UX design, branding, and user experience' },
  { value: 'PRODUCT_DEVELOPMENT', label: 'Product Development', description: 'Full-cycle product creation and iteration' },
  { value: 'DATA_ANALYTICS', label: 'Data Analytics', description: 'Data analysis, insights, and business intelligence' },
  { value: 'DEVOPS', label: 'DevOps', description: 'Infrastructure, deployment, and automation' },
];

export const roles = [
  { 
    value: 'SOFTWARE_ENGINEER', 
    label: 'Software Engineer',
    description: 'Writes production-ready code, implements features, and fixes bugs'
  },
  { 
    value: 'QA_ENGINEER', 
    label: 'QA Engineer',
    description: 'Writes and executes tests, ensures quality standards, performs code reviews'
  },
  { 
    value: 'PRODUCT_OWNER', 
    label: 'Product Owner',
    description: 'Takes ideas and creates business requirements, monetization plans, and product roadmaps'
  },
  { 
    value: 'SALES_ENGINEER', 
    label: 'Sales Engineer',
    description: 'Creates data collection plans, analyzes data for opportunities, and drives growth strategies'
  },
  { 
    value: 'TECH_LEAD', 
    label: 'Tech Lead',
    description: 'Delegates tasks, analyzes agent performance/productivity, suggests improvements, and provides technical direction'
  },
  { 
    value: 'DESIGNER', 
    label: 'Designer',
    description: 'Creates UI/UX designs, prototypes, and design systems'
  },
  { 
    value: 'ARCHITECT', 
    label: 'Software Architect',
    description: 'Designs system architecture, makes technical decisions, and ensures scalability'
  },
  { 
    value: 'DEVOPS_ENGINEER', 
    label: 'DevOps Engineer',
    description: 'Manages infrastructure, CI/CD pipelines, deployment, and monitoring'
  },
  { 
    value: 'SECURITY_ENGINEER', 
    label: 'Security Engineer',
    description: 'Identifies vulnerabilities, implements security best practices, and conducts audits'
  },
  { 
    value: 'CUSTOM', 
    label: 'Custom Role',
    description: 'Define a custom role with specific responsibilities'
  },
];

export const expertise = [
  // Web Frameworks
  { value: 'NEXTJS', label: 'Next.js', category: 'Web' },
  { value: 'REACT', label: 'React', category: 'Web' },
  { value: 'TYPESCRIPT', label: 'TypeScript', category: 'Web' },
  { value: 'TAILWIND', label: 'Tailwind CSS', category: 'Web' },
  
  // Mobile
  { value: 'EXPO', label: 'Expo', category: 'Mobile' },
  { value: 'REACT_NATIVE', label: 'React Native', category: 'Mobile' },
  
  // Desktop
  { value: 'ELECTRON', label: 'Electron', category: 'Desktop' },
  
  // Backend & APIs
  { value: 'NODEJS', label: 'Node.js', category: 'Backend' },
  { value: 'REST_API', label: 'REST APIs', category: 'Backend' },
  { value: 'GRAPHQL', label: 'GraphQL', category: 'Backend' },
  { value: 'PRISMA', label: 'Prisma ORM', category: 'Backend' },
  
  // Databases
  { value: 'POSTGRESQL', label: 'PostgreSQL', category: 'Database' },
  { value: 'MONGODB', label: 'MongoDB', category: 'Database' },
  { value: 'REDIS', label: 'Redis', category: 'Database' },
  
  // Testing
  { value: 'VITEST', label: 'Vitest', category: 'Testing' },
  { value: 'PLAYWRIGHT', label: 'Playwright', category: 'Testing' },
  { value: 'JEST', label: 'Jest', category: 'Testing' },
  
  // Cloud & DevOps
  { value: 'VERCEL', label: 'Vercel', category: 'Cloud' },
  { value: 'AWS', label: 'AWS', category: 'Cloud' },
  { value: 'DOCKER', label: 'Docker', category: 'DevOps' },
  { value: 'GITHUB_ACTIONS', label: 'GitHub Actions', category: 'DevOps' },
  
  // Design & Product
  { value: 'FIGMA', label: 'Figma', category: 'Design' },
  { value: 'UI_UX', label: 'UI/UX Design', category: 'Design' },
  { value: 'PRODUCT_STRATEGY', label: 'Product Strategy', category: 'Product' },
  { value: 'ANALYTICS', label: 'Analytics', category: 'Product' },
  
  // General
  { value: 'GENERALIST', label: 'Generalist', category: 'General' },
  { value: 'CUSTOM', label: 'Custom', category: 'General' },
];
