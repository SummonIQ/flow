/**
 * Microsoft OAuth and Graph API utilities for Outlook calendar and email integration.
 *
 * Required environment variables:
 * - MICROSOFT_CLIENT_ID: Azure AD Application (client) ID
 * - MICROSOFT_CLIENT_SECRET: Azure AD Client secret value
 * - NEXT_PUBLIC_APP_URL: Base URL for OAuth redirect (e.g., http://localhost:3000)
 */

const MICROSOFT_AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0';
const GRAPH_API_URL = 'https://graph.microsoft.com/v1.0';

// Scopes for calendar and email access
const SCOPES = [
  'offline_access',
  'User.Read',
  'Calendars.Read',
  'Calendars.ReadWrite',
  'Mail.Read',
  'Mail.Send',
].join(' ');

export type MicrosoftTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
};

export type MicrosoftUser = {
  id: string;
  displayName: string;
  mail: string | null;
  userPrincipalName: string;
};

export type OutlookCalendarEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location?: string;
};

export type OutlookEmail = {
  id: string;
  subject: string;
  bodyPreview: string;
  from: { emailAddress: { name: string; address: string } };
  toRecipients: Array<{ emailAddress: { name: string; address: string } }>;
  receivedDateTime: string;
  isRead: boolean;
  hasAttachments: boolean;
};

function getClientId(): string {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  if (!clientId) {
    throw new Error('MICROSOFT_CLIENT_ID environment variable is not set');
  }
  return clientId;
}

function getClientSecret(): string {
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  if (!clientSecret) {
    throw new Error('MICROSOFT_CLIENT_SECRET environment variable is not set');
  }
  return clientSecret;
}

function getRedirectUri(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/integrations/outlook/callback`;
}

/**
 * Generate the Microsoft OAuth authorization URL.
 */
export function getAuthorizationUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: getClientId(),
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    response_mode: 'query',
    scope: SCOPES,
    ...(state && { state }),
  });

  return `${MICROSOFT_AUTH_URL}/authorize?${params.toString()}`;
}

/**
 * Exchange an authorization code for access and refresh tokens.
 */
export async function exchangeCodeForTokens(
  code: string,
): Promise<MicrosoftTokens> {
  const response = await fetch(`${MICROSOFT_AUTH_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: getClientId(),
      client_secret: getClientSecret(),
      code,
      redirect_uri: getRedirectUri(),
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}

/**
 * Refresh an access token using a refresh token.
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<MicrosoftTokens> {
  const response = await fetch(`${MICROSOFT_AUTH_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: getClientId(),
      client_secret: getClientSecret(),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: SCOPES,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh access token: ${error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}

/**
 * Get the current user's profile from Microsoft Graph.
 */
export async function getCurrentUser(
  accessToken: string,
): Promise<MicrosoftUser> {
  const response = await fetch(`${GRAPH_API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch user profile: ${error}`);
  }

  return response.json();
}

/**
 * Fetch calendar events from Outlook within a date range.
 */
export async function fetchOutlookCalendarEvents(params: {
  accessToken: string;
  start: Date;
  end: Date;
}): Promise<OutlookCalendarEvent[]> {
  const startISO = params.start.toISOString();
  const endISO = params.end.toISOString();

  const queryParams = new URLSearchParams({
    startDateTime: startISO,
    endDateTime: endISO,
    $select: 'id,subject,start,end,isAllDay,location',
    $orderby: 'start/dateTime',
    $top: '100',
  });

  const response = await fetch(
    `${GRAPH_API_URL}/me/calendarView?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        Prefer: 'outlook.timezone="UTC"',
      },
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch calendar events: ${error}`);
  }

  const data = await response.json();

  return (data.value || []).map(
    (event: {
      id: string;
      subject: string;
      start: { dateTime: string };
      end: { dateTime: string };
      isAllDay: boolean;
      location?: { displayName: string };
    }) => ({
      id: event.id,
      title: event.subject || '(No title)',
      startTime: new Date(event.start.dateTime + 'Z').toISOString(),
      endTime: new Date(event.end.dateTime + 'Z').toISOString(),
      isAllDay: event.isAllDay,
      location: event.location?.displayName,
    }),
  );
}

/**
 * Fetch emails from Outlook inbox.
 */
export async function fetchOutlookEmails(params: {
  accessToken: string;
  folder?: string;
  top?: number;
  filter?: string;
}): Promise<OutlookEmail[]> {
  const folder = params.folder || 'inbox';
  const queryParams = new URLSearchParams({
    $select:
      'id,subject,bodyPreview,from,toRecipients,receivedDateTime,isRead,hasAttachments',
    $orderby: 'receivedDateTime desc',
    $top: String(params.top || 25),
    ...(params.filter && { $filter: params.filter }),
  });

  const response = await fetch(
    `${GRAPH_API_URL}/me/mailFolders/${folder}/messages?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch emails: ${error}`);
  }

  const data = await response.json();
  return data.value || [];
}

/**
 * Get unread email count from Outlook inbox.
 */
export async function getOutlookUnreadCount(
  accessToken: string,
): Promise<number> {
  const response = await fetch(`${GRAPH_API_URL}/me/mailFolders/inbox`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch inbox info: ${error}`);
  }

  const data = await response.json();
  return data.unreadItemCount || 0;
}

/**
 * Send an email via Outlook.
 */
export async function sendOutlookEmail(params: {
  accessToken: string;
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  bodyType?: 'Text' | 'HTML';
}): Promise<void> {
  const message = {
    message: {
      subject: params.subject,
      body: {
        contentType: params.bodyType || 'Text',
        content: params.body,
      },
      toRecipients: params.to.map(email => ({
        emailAddress: { address: email },
      })),
      ...(params.cc && {
        ccRecipients: params.cc.map(email => ({
          emailAddress: { address: email },
        })),
      }),
    },
  };

  const response = await fetch(`${GRAPH_API_URL}/me/sendMail`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }
}

/**
 * Mark an email as read.
 */
export async function markOutlookEmailRead(params: {
  accessToken: string;
  messageId: string;
  isRead?: boolean;
}): Promise<void> {
  const response = await fetch(
    `${GRAPH_API_URL}/me/messages/${params.messageId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isRead: params.isRead ?? true }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update email: ${error}`);
  }
}
