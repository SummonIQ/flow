'use server';

import prisma from '@/lib/db/prisma';
import type { Client, ClientTier } from '@prisma/client';

export async function getClients(limit = 10) {
  try {
    const clients = await prisma.client.findMany({
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { projects: true, invoices: true },
        },
      },
    });
    return { success: true, data: clients };
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return { success: false, error: 'Failed to fetch clients' };
  }
}

export async function getClientStats() {
  try {
    const [total, byTier, byHealth] = await Promise.all([
      prisma.client.count(),
      prisma.client.groupBy({
        by: ['tier'],
        _count: true,
      }),
      prisma.client.groupBy({
        by: ['health'],
        _count: true,
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        byTier: Object.fromEntries(byTier.map(t => [t.tier, t._count])),
        byHealth: Object.fromEntries(byHealth.map(h => [h.health, h._count])),
      },
    };
  } catch (error) {
    console.error('Failed to fetch client stats:', error);
    return { success: false, error: 'Failed to fetch client stats' };
  }
}

export async function createClient(data: {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  tier?: ClientTier;
  owner?: string;
  notes?: string;
  website?: string;
  industry?: string;
}) {
  try {
    const client = await prisma.client.create({ data });
    return { success: true, data: client };
  } catch (error) {
    console.error('Failed to create client:', error);
    return { success: false, error: 'Failed to create client' };
  }
}

export async function updateClient(id: string, data: Partial<Client>) {
  try {
    const client = await prisma.client.update({
      where: { id },
      data,
    });
    return { success: true, data: client };
  } catch (error) {
    console.error('Failed to update client:', error);
    return { success: false, error: 'Failed to update client' };
  }
}

export async function deleteClient(id: string) {
  try {
    await prisma.client.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error('Failed to delete client:', error);
    return { success: false, error: 'Failed to delete client' };
  }
}
