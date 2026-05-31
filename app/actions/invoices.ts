'use server';

import prisma from '@/lib/db/prisma';
import type { InvoiceStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export async function getInvoices(options?: {
  status?: InvoiceStatus;
  limit?: number;
}) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: options?.status ? { status: options.status } : undefined,
      take: options?.limit ?? 10,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { name: true } },
        _count: { select: { lineItems: true, payments: true } },
      },
    });
    return { success: true, data: invoices };
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return { success: false, error: 'Failed to fetch invoices' };
  }
}

export async function getInvoiceStats() {
  try {
    const [totalOutstanding, totalPastDue, totalPaid, countByStatus] =
      await Promise.all([
        prisma.invoice.aggregate({
          where: { status: { in: ['SENT', 'VIEWED', 'PARTIAL'] } },
          _sum: { total: true },
        }),
        prisma.invoice.aggregate({
          where: { status: 'OVERDUE' },
          _sum: { total: true },
        }),
        prisma.invoice.aggregate({
          where: { status: 'PAID' },
          _sum: { total: true },
        }),
        prisma.invoice.groupBy({
          by: ['status'],
          _count: true,
        }),
      ]);

    return {
      success: true,
      data: {
        outstanding: totalOutstanding._sum.total?.toNumber() ?? 0,
        pastDue: totalPastDue._sum.total?.toNumber() ?? 0,
        collected: totalPaid._sum.total?.toNumber() ?? 0,
        countByStatus: Object.fromEntries(
          countByStatus.map(s => [s.status, s._count]),
        ),
      },
    };
  } catch (error) {
    console.error('Failed to fetch invoice stats:', error);
    return { success: false, error: 'Failed to fetch invoice stats' };
  }
}

export async function createInvoice(data: {
  clientId: string;
  number: string;
  dueDate: Date;
  subtotal: number;
  tax?: number;
  total: number;
  currency?: string;
  notes?: string;
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}) {
  try {
    const { lineItems, ...invoiceData } = data;
    const invoice = await prisma.invoice.create({
      data: {
        ...invoiceData,
        lineItems: lineItems
          ? {
              create: lineItems.map(item => ({
                description: item.description,
                quantity: new Decimal(item.quantity),
                unitPrice: new Decimal(item.unitPrice),
                amount: new Decimal(item.amount),
              })),
            }
          : undefined,
      },
      include: { lineItems: true },
    });
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Failed to create invoice:', error);
    return { success: false, error: 'Failed to create invoice' };
  }
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  try {
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidAt: status === 'PAID' ? new Date() : undefined,
      },
    });
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Failed to update invoice status:', error);
    return { success: false, error: 'Failed to update invoice status' };
  }
}

export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error('Failed to delete invoice:', error);
    return { success: false, error: 'Failed to delete invoice' };
  }
}
