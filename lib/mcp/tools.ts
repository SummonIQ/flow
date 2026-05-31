/**
 * Flow MCP Tools
 *
 * Provides AI assistant access to Flow agency management:
 * - Projects, Tasks, Clients, Meetings, Invoices, Time entries
 */

import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

// ===========================================
// Tool Schemas
// ===========================================

export const ListProjectsSchema = z.object({
  clientId: z.string().optional(),
  status: z
    .enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'])
    .optional(),
  limit: z.number().optional().default(50),
});

export const GetProjectSchema = z.object({
  id: z.string(),
});

export const CreateProjectSchema = z.object({
  clientId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .optional()
    .default('MEDIUM'),
  dueDate: z.string().optional(),
});

export const ListTasksSchema = z.object({
  projectId: z.string().optional(),
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'])
    .optional(),
  assignee: z.string().optional(),
  limit: z.number().optional().default(50),
});

export const GetTaskSchema = z.object({
  id: z.string(),
});

export const CreateTaskSchema = z.object({
  projectId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .optional()
    .default('MEDIUM'),
  assignee: z.string().optional(),
  dueDate: z.string().optional(),
});

export const UpdateTaskSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'])
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignee: z.string().optional(),
  dueDate: z.string().optional(),
});

export const ListClientsSchema = z.object({
  tier: z.enum(['STANDARD', 'GROWTH', 'ENTERPRISE', 'VIP']).optional(),
  health: z.enum(['HEALTHY', 'WATCH', 'AT_RISK', 'CHURNED']).optional(),
  limit: z.number().optional().default(50),
});

export const GetClientSchema = z.object({
  id: z.string(),
});

export const ListMeetingsSchema = z.object({
  clientId: z.string().optional(),
  type: z
    .enum([
      'INTERNAL',
      'CLIENT_CALL',
      'ONBOARDING',
      'REVIEW',
      'DELIVERY',
      'BILLING',
      'OTHER',
    ])
    .optional(),
  startAfter: z.string().optional(),
  limit: z.number().optional().default(50),
});

export const CreateMeetingSchema = z.object({
  title: z.string(),
  clientId: z.string().optional(),
  type: z
    .enum([
      'INTERNAL',
      'CLIENT_CALL',
      'ONBOARDING',
      'REVIEW',
      'DELIVERY',
      'BILLING',
      'OTHER',
    ])
    .optional()
    .default('INTERNAL'),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().optional(),
  meetingUrl: z.string().optional(),
  description: z.string().optional(),
  attendees: z.array(z.string()).optional().default([]),
});

export const ListInvoicesSchema = z.object({
  clientId: z.string().optional(),
  status: z
    .enum([
      'DRAFT',
      'SENT',
      'VIEWED',
      'PAID',
      'PARTIAL',
      'OVERDUE',
      'CANCELLED',
    ])
    .optional(),
  limit: z.number().optional().default(50),
});

export const GetInvoiceSchema = z.object({
  id: z.string(),
});

export const ListTimeEntriesSchema = z.object({
  projectId: z.string().optional(),
  billable: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().optional().default(100),
});

export const CreateTimeEntrySchema = z.object({
  projectId: z.string(),
  description: z.string().optional(),
  hours: z.number(),
  date: z.string().optional(),
  billable: z.boolean().optional().default(true),
});

// ===========================================
// Tool Definitions (for MCP protocol)
// ===========================================

export const toolDefinitions = [
  {
    name: 'list_projects',
    description: 'List all projects with optional filters by client, status',
    inputSchema: {
      type: 'object',
      properties: {
        clientId: { type: 'string', description: 'Filter by client ID' },
        status: {
          type: 'string',
          enum: [
            'PLANNING',
            'IN_PROGRESS',
            'ON_HOLD',
            'COMPLETED',
            'CANCELLED',
          ],
        },
        limit: { type: 'number', default: 50 },
      },
    },
  },
  {
    name: 'get_project',
    description:
      'Get detailed project information including tasks and milestones',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Project ID' } },
      required: ['id'],
    },
  },
  {
    name: 'create_project',
    description: 'Create a new project for a client',
    inputSchema: {
      type: 'object',
      properties: {
        clientId: { type: 'string', description: 'Client ID' },
        name: { type: 'string', description: 'Project name' },
        description: { type: 'string' },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
        dueDate: { type: 'string', description: 'Due date (ISO 8601)' },
      },
      required: ['clientId', 'name'],
    },
  },
  {
    name: 'list_tasks',
    description:
      'List tasks with optional filters by project, status, assignee',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string' },
        status: {
          type: 'string',
          enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'],
        },
        assignee: { type: 'string' },
        limit: { type: 'number', default: 50 },
      },
    },
  },
  {
    name: 'get_task',
    description: 'Get detailed task information',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Task ID' } },
      required: ['id'],
    },
  },
  {
    name: 'create_task',
    description: 'Create a new task in a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string' },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
        assignee: { type: 'string' },
        dueDate: { type: 'string' },
      },
      required: ['projectId', 'title'],
    },
  },
  {
    name: 'update_task',
    description: 'Update an existing task (status, priority, assignee, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID' },
        title: { type: 'string' },
        description: { type: 'string' },
        status: {
          type: 'string',
          enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'],
        },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
        assignee: { type: 'string' },
        dueDate: { type: 'string' },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_clients',
    description: 'List all clients with optional filters by tier and health',
    inputSchema: {
      type: 'object',
      properties: {
        tier: {
          type: 'string',
          enum: ['STANDARD', 'GROWTH', 'ENTERPRISE', 'VIP'],
        },
        health: {
          type: 'string',
          enum: ['HEALTHY', 'WATCH', 'AT_RISK', 'CHURNED'],
        },
        limit: { type: 'number', default: 50 },
      },
    },
  },
  {
    name: 'get_client',
    description:
      'Get detailed client information including projects and contacts',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Client ID' } },
      required: ['id'],
    },
  },
  {
    name: 'list_meetings',
    description: 'List meetings with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        clientId: { type: 'string' },
        type: {
          type: 'string',
          enum: [
            'INTERNAL',
            'CLIENT_CALL',
            'ONBOARDING',
            'REVIEW',
            'DELIVERY',
            'BILLING',
            'OTHER',
          ],
        },
        startAfter: { type: 'string', description: 'ISO 8601 date' },
        limit: { type: 'number', default: 50 },
      },
    },
  },
  {
    name: 'create_meeting',
    description: 'Schedule a new meeting',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        clientId: { type: 'string' },
        type: {
          type: 'string',
          enum: [
            'INTERNAL',
            'CLIENT_CALL',
            'ONBOARDING',
            'REVIEW',
            'DELIVERY',
            'BILLING',
            'OTHER',
          ],
        },
        startTime: { type: 'string', description: 'ISO 8601' },
        endTime: { type: 'string', description: 'ISO 8601' },
        location: { type: 'string' },
        meetingUrl: { type: 'string' },
        description: { type: 'string' },
        attendees: { type: 'array', items: { type: 'string' } },
      },
      required: ['title', 'startTime', 'endTime'],
    },
  },
  {
    name: 'list_invoices',
    description: 'List invoices with optional filters by client and status',
    inputSchema: {
      type: 'object',
      properties: {
        clientId: { type: 'string' },
        status: {
          type: 'string',
          enum: [
            'DRAFT',
            'SENT',
            'VIEWED',
            'PAID',
            'PARTIAL',
            'OVERDUE',
            'CANCELLED',
          ],
        },
        limit: { type: 'number', default: 50 },
      },
    },
  },
  {
    name: 'get_invoice',
    description: 'Get detailed invoice information with line items',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Invoice ID' } },
      required: ['id'],
    },
  },
  {
    name: 'list_time_entries',
    description: 'List time entries with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string' },
        billable: { type: 'boolean' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        limit: { type: 'number', default: 100 },
      },
    },
  },
  {
    name: 'create_time_entry',
    description: 'Log time worked on a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string' },
        description: { type: 'string' },
        hours: { type: 'number' },
        date: { type: 'string' },
        billable: { type: 'boolean', default: true },
      },
      required: ['projectId', 'hours'],
    },
  },
];

// ===========================================
// Tool Handlers
// ===========================================

export async function handleTool(
  name: string,
  args: unknown,
): Promise<{ result?: unknown; error?: string }> {
  try {
    switch (name) {
      case 'list_projects': {
        const { clientId, status, limit } = ListProjectsSchema.parse(args);
        const projects = await prisma.project.findMany({
          where: { ...(clientId && { clientId }), ...(status && { status }) },
          include: {
            client: { select: { id: true, name: true } },
            _count: { select: { tasks: true, milestones: true } },
          },
          orderBy: { updatedAt: 'desc' },
          take: limit,
        });
        return { result: projects };
      }

      case 'get_project': {
        const { id } = GetProjectSchema.parse(args);
        const project = await prisma.project.findUnique({
          where: { id },
          include: {
            client: true,
            tasks: { orderBy: { position: 'asc' } },
            milestones: { orderBy: { dueDate: 'asc' } },
          },
        });
        if (!project) return { error: `Project not found: ${id}` };
        return { result: project };
      }

      case 'create_project': {
        const data = CreateProjectSchema.parse(args);
        const project = await prisma.project.create({
          data: {
            clientId: data.clientId,
            name: data.name,
            description: data.description,
            priority: data.priority,
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          },
          include: { client: { select: { id: true, name: true } } },
        });
        return { result: project };
      }

      case 'list_tasks': {
        const { projectId, status, assignee, limit } =
          ListTasksSchema.parse(args);
        const tasks = await prisma.task.findMany({
          where: {
            ...(projectId && { projectId }),
            ...(status && { status }),
            ...(assignee && { assignee }),
          },
          include: { project: { select: { id: true, name: true } } },
          orderBy: [{ priority: 'desc' }, { position: 'asc' }],
          take: limit,
        });
        return { result: tasks };
      }

      case 'get_task': {
        const { id } = GetTaskSchema.parse(args);
        const task = await prisma.task.findUnique({
          where: { id },
          include: { project: { include: { client: true } } },
        });
        if (!task) return { error: `Task not found: ${id}` };
        return { result: task };
      }

      case 'create_task': {
        const data = CreateTaskSchema.parse(args);
        const maxPos = await prisma.task.aggregate({
          where: { projectId: data.projectId },
          _max: { position: true },
        });
        const task = await prisma.task.create({
          data: {
            projectId: data.projectId,
            title: data.title,
            description: data.description,
            priority: data.priority,
            assignee: data.assignee,
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            position: (maxPos._max.position ?? 0) + 1,
          },
          include: { project: { select: { id: true, name: true } } },
        });
        return { result: task };
      }

      case 'update_task': {
        const { id, ...updates } = UpdateTaskSchema.parse(args);
        const task = await prisma.task.update({
          where: { id },
          data: {
            ...updates,
            ...(updates.dueDate && { dueDate: new Date(updates.dueDate) }),
            ...(updates.status === 'DONE' && { completedAt: new Date() }),
          },
          include: { project: { select: { id: true, name: true } } },
        });
        return { result: task };
      }

      case 'list_clients': {
        const { tier, health, limit } = ListClientsSchema.parse(args);
        const clients = await prisma.client.findMany({
          where: { ...(tier && { tier }), ...(health && { health }) },
          include: {
            _count: {
              select: { projects: true, contacts: true, invoices: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: limit,
        });
        return { result: clients };
      }

      case 'get_client': {
        const { id } = GetClientSchema.parse(args);
        const client = await prisma.client.findUnique({
          where: { id },
          include: {
            projects: { take: 10, orderBy: { updatedAt: 'desc' } },
            contacts: true,
            invoices: { take: 5, orderBy: { issueDate: 'desc' } },
          },
        });
        if (!client) return { error: `Client not found: ${id}` };
        return { result: client };
      }

      case 'list_meetings': {
        const { clientId, type, startAfter, limit } =
          ListMeetingsSchema.parse(args);
        const meetings = await prisma.meeting.findMany({
          where: {
            ...(clientId && { clientId }),
            ...(type && { type }),
            ...(startAfter && { startTime: { gte: new Date(startAfter) } }),
          },
          include: { client: { select: { id: true, name: true } } },
          orderBy: { startTime: 'asc' },
          take: limit,
        });
        return { result: meetings };
      }

      case 'create_meeting': {
        const data = CreateMeetingSchema.parse(args);
        const meeting = await prisma.meeting.create({
          data: {
            title: data.title,
            clientId: data.clientId,
            type: data.type,
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime),
            location: data.location,
            meetingUrl: data.meetingUrl,
            description: data.description,
            attendees: data.attendees,
          },
          include: { client: { select: { id: true, name: true } } },
        });
        return { result: meeting };
      }

      case 'list_invoices': {
        const { clientId, status, limit } = ListInvoicesSchema.parse(args);
        const invoices = await prisma.invoice.findMany({
          where: { ...(clientId && { clientId }), ...(status && { status }) },
          include: { client: { select: { id: true, name: true } } },
          orderBy: { issueDate: 'desc' },
          take: limit,
        });
        return { result: invoices };
      }

      case 'get_invoice': {
        const { id } = GetInvoiceSchema.parse(args);
        const invoice = await prisma.invoice.findUnique({
          where: { id },
          include: { client: true, lineItems: true, payments: true },
        });
        if (!invoice) return { error: `Invoice not found: ${id}` };
        return { result: invoice };
      }

      case 'list_time_entries': {
        const { projectId, billable, startDate, endDate, limit } =
          ListTimeEntriesSchema.parse(args);
        const entries = await prisma.timeEntry.findMany({
          where: {
            ...(projectId && { projectId }),
            ...(billable !== undefined && { billable }),
            ...(startDate && { date: { gte: new Date(startDate) } }),
            ...(endDate && { date: { lte: new Date(endDate) } }),
          },
          include: { project: { select: { id: true, name: true } } },
          orderBy: { date: 'desc' },
          take: limit,
        });
        return { result: entries };
      }

      case 'create_time_entry': {
        const data = CreateTimeEntrySchema.parse(args);
        const entry = await prisma.timeEntry.create({
          data: {
            projectId: data.projectId,
            description: data.description,
            hours: data.hours,
            date: data.date ? new Date(data.date) : new Date(),
            billable: data.billable,
          },
          include: { project: { select: { id: true, name: true } } },
        });
        return { result: entry };
      }

      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: `Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
      };
    }
    return { error: error instanceof Error ? error.message : String(error) };
  }
}
