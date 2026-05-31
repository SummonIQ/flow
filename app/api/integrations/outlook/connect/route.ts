import { NextResponse } from 'next/server';

import { getAuthorizationUrl } from '@/lib/oauth/microsoft';

export async function GET() {
  try {
    const state = `outlook_${Date.now()}`;
    const authUrl = getAuthorizationUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Failed to initiate Outlook OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Outlook connection' },
      { status: 500 },
    );
  }
}
