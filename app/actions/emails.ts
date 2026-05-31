'use server';

import prisma from '@/lib/db/prisma';
import type { EmailStatus } from '@prisma/client';

export async function getEmails(options?: {
  status?: EmailStatus;
  unreadOnly?: boolean;
  limit?: number;
}) {
  try {
    const emails = await prisma.email.findMany({
      where: {
        ...(options?.status && { status: options.status }),
        ...(options?.unreadOnly && { isRead: false }),
      },
      take: options?.limit ?? 20,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { name: true } },
      },
    });
    return { success: true, data: emails };
  } catch (error) {
    console.error('Failed to fetch emails:', error);
    return { success: false, error: 'Failed to fetch emails' };
  }
}

export async function getEmailStats() {
  try {
    const [unread, sent, drafts] = await Promise.all([
      prisma.email.count({ where: { isRead: false, status: 'RECEIVED' } }),
      prisma.email.count({ where: { status: 'SENT' } }),
      prisma.email.count({ where: { status: 'DRAFT' } }),
    ]);

    return {
      success: true,
      data: { unread, sent, drafts },
    };
  } catch (error) {
    console.error('Failed to fetch email stats:', error);
    return { success: false, error: 'Failed to fetch email stats' };
  }
}

export async function createEmail(data: {
  subject: string;
  body: string;
  from: string;
  to: string[];
  cc?: string[];
  clientId?: string;
  status?: EmailStatus;
}) {
  try {
    const email = await prisma.email.create({ data });
    return { success: true, data: email };
  } catch (error) {
    console.error('Failed to create email:', error);
    return { success: false, error: 'Failed to create email' };
  }
}

export async function markEmailRead(id: string, isRead = true) {
  try {
    const email = await prisma.email.update({
      where: { id },
      data: { isRead },
    });
    return { success: true, data: email };
  } catch (error) {
    console.error('Failed to mark email as read:', error);
    return { success: false, error: 'Failed to mark email as read' };
  }
}

export async function starEmail(id: string, isStarred = true) {
  try {
    const email = await prisma.email.update({
      where: { id },
      data: { isStarred },
    });
    return { success: true, data: email };
  } catch (error) {
    console.error('Failed to star email:', error);
    return { success: false, error: 'Failed to star email' };
  }
}

export async function sendEmail(id: string) {
  try {
    const email = await prisma.email.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });
    return { success: true, data: email };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

export async function deleteEmail(id: string) {
  try {
    await prisma.email.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error('Failed to delete email:', error);
    return { success: false, error: 'Failed to delete email' };
  }
}
