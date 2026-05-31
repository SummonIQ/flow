import { XMLParser } from 'fast-xml-parser';
import ICAL from 'ical.js';

export type AppleCalendarEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
};

function toBasicAuthHeader(username: string, password: string) {
  const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
  return `Basic ${token}`;
}

function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

function getString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function formatCalDavUtc(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
    d.getUTCMinutes(),
  )}${pad(d.getUTCSeconds())}Z`;
}

async function caldavRequest(
  url: string,
  {
    method,
    authHeader,
    depth,
    body,
  }: { method: string; authHeader: string; depth?: '0' | '1'; body?: string },
) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: authHeader,
      Depth: depth ?? '0',
      'Content-Type': 'application/xml; charset=utf-8',
    },
    body,
    cache: 'no-store',
  });

  const text = await res.text();

  if (!res.ok) {
    const err = new Error(`CalDAV request failed: ${res.status}`) as Error & {
      status?: number;
      body?: string;
    };
    err.status = res.status;
    err.body = text;
    throw err;
  }

  return text;
}

function parseXml(xml: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
    trimValues: true,
  });
  return parser.parse(xml) as unknown;
}

function extractHrefFromProp(xmlObj: unknown, propName: string): string | null {
  const root = asRecord(xmlObj);
  const multistatus = asRecord(root?.multistatus);
  const responses = ensureArray(multistatus?.response);

  for (const response of responses) {
    const r = asRecord(response);
    const propstats = ensureArray(r?.propstat);
    for (const propstat of propstats) {
      const ps = asRecord(propstat);
      const prop = asRecord(ps?.prop);
      const propVal = asRecord(prop?.[propName]);
      const href = getString(propVal?.href);
      if (href) return href;
    }
  }

  return null;
}

function listCalendarUrlsFromHomeSet(homeSetXmlObj: unknown, baseUrl: string) {
  const root = asRecord(homeSetXmlObj);
  const multistatus = asRecord(root?.multistatus);
  const responses = ensureArray(multistatus?.response);

  const urls: string[] = [];

  for (const r of responses) {
    const response = asRecord(r);
    const propstats = ensureArray(response?.propstat);
    for (const ps of propstats) {
      const propstat = asRecord(ps);
      const prop = asRecord(propstat?.prop);
      const resourcetype = asRecord(prop?.resourcetype);
      const isCalendar = !!asRecord(resourcetype?.calendar);
      if (!isCalendar) continue;

      const href = getString(response?.href);
      if (href) urls.push(new URL(href, baseUrl).toString());
    }
  }

  return Array.from(new Set(urls));
}

function parseICalEvents(ics: string, start: Date, end: Date): AppleCalendarEvent[] {
  const jcal = ICAL.parse(ics);
  const vcalendar = new ICAL.Component(jcal);
  const vevents = vcalendar.getAllSubcomponents('vevent');

  const out: AppleCalendarEvent[] = [];

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);

    if (event.isRecurring()) {
      const iterator = event.iterator(ICAL.Time.fromJSDate(start, true));
      while (true) {
        const next = iterator.next();
        if (!next) break;
        const nextDate = next.toJSDate();
        if (nextDate > end) break;

        const details = event.getOccurrenceDetails(next);
        const occStart = details.startDate.toJSDate();
        const occEnd = details.endDate.toJSDate();

        if (occEnd <= start || occStart >= end) continue;

        out.push({
          id: `${event.uid}:${details.recurrenceId.toString()}`,
          title: details.item?.summary || event.summary || '(No title)',
          startTime: occStart.toISOString(),
          endTime: occEnd.toISOString(),
          isAllDay: details.startDate.isDate,
        });
      }
    } else {
      const startDate = event.startDate?.toJSDate();
      const endDate = event.endDate?.toJSDate();
      if (!startDate || !endDate) continue;
      if (endDate <= start || startDate >= end) continue;

      out.push({
        id: event.uid || `${startDate.toISOString()}-${endDate.toISOString()}`,
        title: event.summary || '(No title)',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        isAllDay: event.startDate?.isDate ?? false,
      });
    }
  }

  out.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );
  return out;
}

export async function fetchAppleCalendarEvents(params: {
  icloudEmail: string;
  appPassword: string;
  start: Date;
  end: Date;
}): Promise<AppleCalendarEvent[]> {
  const baseUrl = 'https://caldav.icloud.com';
  const authHeader = toBasicAuthHeader(params.icloudEmail, params.appPassword);

  const principalXml = await caldavRequest(baseUrl + '/', {
    method: 'PROPFIND',
    authHeader,
    depth: '0',
    body: `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:current-user-principal />
  </d:prop>
</d:propfind>`,
  });

  const principalObj = parseXml(principalXml);
  const principalHref = extractHrefFromProp(
    principalObj,
    'current-user-principal',
  );

  if (!principalHref) {
    throw new Error('Unable to discover iCloud principal URL');
  }

  const principalUrl = new URL(principalHref, baseUrl).toString();

  const homeXml = await caldavRequest(principalUrl, {
    method: 'PROPFIND',
    authHeader,
    depth: '0',
    body: `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <cal:calendar-home-set />
  </d:prop>
</d:propfind>`,
  });

  const homeObj = parseXml(homeXml);
  const calendarHomeHref = extractHrefFromProp(homeObj, 'calendar-home-set');

  if (!calendarHomeHref) {
    throw new Error('Unable to discover iCloud calendar home');
  }

  const calendarHomeUrl = new URL(calendarHomeHref, baseUrl).toString();

  const calendarsXml = await caldavRequest(calendarHomeUrl, {
    method: 'PROPFIND',
    authHeader,
    depth: '1',
    body: `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:displayname />
    <d:resourcetype />
  </d:prop>
</d:propfind>`,
  });

  const calendarsObj = parseXml(calendarsXml);
  const calendarUrls = listCalendarUrlsFromHomeSet(calendarsObj, baseUrl);

  if (calendarUrls.length === 0) {
    throw new Error('Unable to locate an iCloud calendar');
  }

  const queryBody = `<?xml version="1.0" encoding="utf-8"?>
<cal:calendar-query xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:getetag />
    <cal:calendar-data />
  </d:prop>
  <cal:filter>
    <cal:comp-filter name="VCALENDAR">
      <cal:comp-filter name="VEVENT">
        <cal:time-range start="${formatCalDavUtc(params.start)}" end="${formatCalDavUtc(params.end)}" />
      </cal:comp-filter>
    </cal:comp-filter>
  </cal:filter>
</cal:calendar-query>`;

  const results = await Promise.all(
    calendarUrls.map(async calendarUrl => {
      const reportXml = await caldavRequest(calendarUrl, {
        method: 'REPORT',
        authHeader,
        depth: '1',
        body: queryBody,
      });
      const reportObj = parseXml(reportXml);
      const root = asRecord(reportObj);
      const multistatus = asRecord(root?.multistatus);
      const responses = ensureArray(multistatus?.response);

      const events: AppleCalendarEvent[] = [];

      for (const response of responses) {
        const res = asRecord(response);
        const propstats = ensureArray(res?.propstat);
        for (const propstat of propstats) {
          const ps = asRecord(propstat);
          const prop = asRecord(ps?.prop);
          const ics = getString(prop?.['calendar-data']);
          if (typeof ics !== 'string' || !ics.trim()) continue;
          events.push(...parseICalEvents(ics, params.start, params.end));
        }
      }

      return events;
    }),
  );

  return results.flat();
}
