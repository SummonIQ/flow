export type UpworkListingItem = {
  url: string;
  title: string;
  description: string;
  tags?: string[];
  paymentVerified?: boolean;
  clientSpent?: string;
  proposals?: string;
  posted?: string;
  budgetLine?: string;
  budgetType?: string;
  experienceLevel?: string;
  budgetEstimate?: string;
};

export type UpworkAuditResponse = {
  mode: 'ai' | 'template';
  items: UpworkListingItem[];
};

type AuditInput = {
  html: string;
  url?: string;
  signal?: AbortSignal;
};

function isAuditResponse(value: unknown): value is UpworkAuditResponse {
  if (!value || typeof value !== 'object') return false;
  const record = value as UpworkAuditResponse;
  return (
    (record.mode === 'ai' || record.mode === 'template') &&
    Array.isArray(record.items)
  );
}

export async function auditUpworkListing({
  html,
  url,
  signal,
}: AuditInput): Promise<UpworkAuditResponse> {
  const resp = await fetch('/api/upwork-guide/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html, url: url ?? '' }),
    signal,
  });

  const json = (await resp.json().catch(() => null)) as
    | UpworkAuditResponse
    | { error?: string }
    | null;

  if (!resp.ok || !json || 'error' in json || !isAuditResponse(json)) {
    const message =
      (json && 'error' in json && json.error) || `Audit failed: ${resp.status}`;
    throw new Error(message);
  }

  return {
    ...json,
    items: json.items.map(item => ({
      ...item,
      description: item.description ?? '',
    })),
  };
}
