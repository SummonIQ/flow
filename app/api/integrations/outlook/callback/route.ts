import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/db/prisma';
import {
  exchangeCodeForTokens,
  getCurrentUser,
} from '@/lib/oauth/microsoft';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUrl = new URL('/settings/integrations', baseUrl);

  if (error) {
    console.error('Outlook OAuth error:', error, errorDescription);
    redirectUrl.searchParams.set('error', 'outlook_auth_failed');
    redirectUrl.searchParams.set(
      'message',
      errorDescription || 'Failed to connect Outlook',
    );
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    redirectUrl.searchParams.set('error', 'missing_code');
    redirectUrl.searchParams.set('message', 'Authorization code not received');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const user = await getCurrentUser(tokens.accessToken);

    // Store the calendar connection
    await prisma.calendarConnection.upsert({
      where: {
        provider_calendarId: {
          provider: 'microsoft',
          calendarId: user.id,
        },
      },
      create: {
        provider: 'microsoft',
        providerAccountId: user.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        calendarId: user.id,
        calendarName: user.mail || user.userPrincipalName,
        isPrimary: true,
      },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        calendarName: user.mail || user.userPrincipalName,
      },
    });

    redirectUrl.searchParams.set('success', 'outlook');
    redirectUrl.searchParams.set('message', 'Outlook connected successfully');
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error('Failed to complete Outlook OAuth:', err);
    redirectUrl.searchParams.set('error', 'token_exchange_failed');
    redirectUrl.searchParams.set(
      'message',
      err instanceof Error ? err.message : 'Failed to connect Outlook',
    );
    return NextResponse.redirect(redirectUrl);
  }
}
