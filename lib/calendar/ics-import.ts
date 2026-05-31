import ICAL from 'ical.js';

export type IcsEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
};

function parseIcsEvents(ics: string, start: Date, end: Date): IcsEvent[] {
  const jcal = ICAL.parse(ics);
  const vcalendar = new ICAL.Component(jcal);
  const vevents = vcalendar.getAllSubcomponents('vevent');

  const out: IcsEvent[] = [];

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

export async function fetchIcsEvents(params: {
  source: string;
  start: Date;
  end: Date;
}): Promise<IcsEvent[]> {
  const trimmed = params.source.trim();

  let ics: string;
  if (/^https?:\/\//i.test(trimmed)) {
    const res = await fetch(trimmed, { cache: 'no-store' });
    if (!res.ok) {
      const err = new Error(`ICS fetch failed: ${res.status}`) as Error & {
        status?: number;
      };
      err.status = res.status;
      throw err;
    }
    ics = await res.text();
  } else {
    ics = trimmed;
  }

  return parseIcsEvents(ics, params.start, params.end);
}
