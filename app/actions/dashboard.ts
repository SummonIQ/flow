'use server';

import prisma from '@/lib/db/prisma';
import { connection } from 'next/server';

export async function getDashboardStats() {
  await connection();
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const [emailStats, meetingStats, projectStats, invoiceStats, clientStats] =
      await Promise.all([
        // Email stats
        prisma.email.count({ where: { isRead: false, status: 'RECEIVED' } }),
        // Meeting stats for today
        prisma.meeting.count({
          where: { startTime: { gte: today, lte: endOfDay } },
        }),
        // Project stats
        prisma.project.count({
          where: { status: { in: ['PLANNING', 'IN_PROGRESS', 'ON_HOLD'] } },
        }),
        // Invoice stats
        prisma.invoice.aggregate({
          where: { status: { in: ['SENT', 'VIEWED', 'PARTIAL', 'OVERDUE'] } },
          _sum: { total: true },
          _count: true,
        }),
        // Client stats
        prisma.client.count(),
      ]);

    return {
      success: true,
      data: {
        inbox: {
          unread: emailStats,
          detail: 'messages to review',
        },
        schedule: {
          count: meetingStats,
          detail: 'meetings today',
        },
        projects: {
          active: projectStats,
          detail: 'in progress',
        },
        billing: {
          outstanding: invoiceStats._sum.total?.toNumber() ?? 0,
          invoiceCount: invoiceStats._count,
        },
        clients: {
          total: clientStats,
        },
      },
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return { success: false, error: 'Failed to fetch dashboard stats' };
  }
}

export async function getDashboardMeetings() {
  await connection();
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const meetings = await prisma.meeting.findMany({
      where: {
        startTime: { gte: today, lte: endOfDay },
      },
      take: 5,
      orderBy: { startTime: 'asc' },
      include: {
        client: { select: { name: true } },
      },
    });

    return { success: true, data: meetings };
  } catch (error) {
    console.error('Failed to fetch dashboard meetings:', error);
    return { success: false, error: 'Failed to fetch dashboard meetings' };
  }
}

export async function getDashboardProjects() {
  await connection();
  try {
    const projects = await prisma.project.findMany({
      where: {
        status: { in: ['PLANNING', 'IN_PROGRESS', 'ON_HOLD'] },
      },
      take: 5,
      orderBy: { dueDate: 'asc' },
      include: {
        client: { select: { name: true } },
      },
    });

    return { success: true, data: projects };
  } catch (error) {
    console.error('Failed to fetch dashboard projects:', error);
    return { success: false, error: 'Failed to fetch dashboard projects' };
  }
}

export async function getDashboardClients() {
  await connection();
  try {
    const clients = await prisma.client.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
    });

    return { success: true, data: clients };
  } catch (error) {
    console.error('Failed to fetch dashboard clients:', error);
    return { success: false, error: 'Failed to fetch dashboard clients' };
  }
}

export async function getDashboardBilling() {
  await connection();
  try {
    const [outstanding, pastDue, collected, recentPayments] = await Promise.all(
      [
        prisma.invoice.aggregate({
          where: { status: { in: ['SENT', 'VIEWED', 'PARTIAL'] } },
          _sum: { total: true },
          _count: true,
        }),
        prisma.invoice.aggregate({
          where: { status: 'OVERDUE' },
          _sum: { total: true },
          _count: true,
        }),
        prisma.payment.aggregate({
          where: {
            receivedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.invoice.aggregate({
          where: { status: 'PAID' },
          _sum: { total: true },
        }),
      ],
    );

    return {
      success: true,
      data: {
        monthlyRecurring: collected._sum.amount?.toNumber() ?? 0,
        outstanding: outstanding._sum.total?.toNumber() ?? 0,
        outstandingCount: outstanding._count,
        pastDue: pastDue._sum.total?.toNumber() ?? 0,
        pastDueCount: pastDue._count,
        collectedThisWeek: collected._sum.amount?.toNumber() ?? 0,
        collectedCount: collected._count,
      },
    };
  } catch (error) {
    console.error('Failed to fetch dashboard billing:', error);
    return { success: false, error: 'Failed to fetch dashboard billing' };
  }
}
