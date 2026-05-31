'use client';

import {
  Page,
} from '@/components/ui/page-layout';

import {
  Badge,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@summoniq/applab-ui';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const viewOptions = ['Year', 'Month', 'Week', 'Day'] as const;
type ViewType = (typeof viewOptions)[number];

type CalendarEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  source: 'meeting' | 'apple' | 'ics';
  calendarName?: string;
  location?: string | null;
};

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isToday?: boolean;
  events?: CalendarEvent[];
  date: Date;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function monthStartKeyForWeek(weekStart: Date): string | null {
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i);
    if (d.getDate() === 1) return monthKey(d);
  }
  return null;
}

function monthLabelKeyForWeek(weekStart: Date): string | null {
  return weekStart.getDate() <= 7 ? monthKey(weekStart) : null;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTimeRange(event: CalendarEvent) {
  if (event.isAllDay) return 'All day';
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const format = (value: Date) =>
    value.toLocaleTimeString('default', {
      hour: 'numeric',
      minute: '2-digit',
    });
  return `${format(start)} - ${format(end)}`;
}

function generateMockEvents(rangeStart: Date, rangeEnd: Date): CalendarEvent[] {
  const titles = [
    'Standup',
    'Client sync',
    'Design review',
    'Sprint planning',
    'Kickoff',
    'Write-up',
    'Workshop',
    'Check-in',
  ];

  const start = new Date(rangeStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(rangeEnd);
  end.setHours(0, 0, 0, 0);

  const out: CalendarEvent[] = [];
  const cursor = new Date(start);
  while (cursor < end) {
    const seed =
      cursor.getFullYear() * 10000 +
      (cursor.getMonth() + 1) * 100 +
      cursor.getDate();
    const count = seed % 4;
    for (let i = 0; i < count; i++) {
      const pick = (seed + i * 7) % titles.length;
      const startHour = ((seed + i * 3) % 9) + 9;
      const startMinute = ((seed + i * 11) % 4) * 15;
      const durationMin = 30 + ((seed + i * 5) % 5) * 15;

      const startTime = new Date(cursor);
      startTime.setHours(startHour, startMinute, 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + durationMin);

      out.push({
        id: `mock-${dateKey(cursor)}-${i}`,
        title: titles[pick] ?? 'Event',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isAllDay: false,
        source: 'meeting',
        calendarName: 'Mock',
        location: null,
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return out;
}

function DayAgendaPanel({
  date,
  events,
}: {
  date: Date;
  events: CalendarEvent[];
}) {
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const sourceLabels = useMemo(
    () => ({ meeting: 'Meeting', apple: 'Apple', ics: 'ICS' }),
    [],
  );

  const eventsByHour = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    for (const evt of events) {
      const start = new Date(evt.startTime);
      const hour = evt.isAllDay
        ? 0
        : isSameDay(start, date)
          ? start.getHours()
          : 0;
      const list = map.get(hour);
      if (list) {
        list.push(evt);
      } else {
        map.set(hour, [evt]);
      }
    }
    return map;
  }, [date, events]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto bg-background">
        <div className="min-w-0">
          {hours.map(hour => {
            const label =
              hour === 0
                ? '12 AM'
                : hour < 12
                  ? `${hour} AM`
                  : hour === 12
                    ? '12 PM'
                    : `${hour - 12} PM`;
            const hourEvents = eventsByHour.get(hour);

            return (
              <div
                key={hour}
                className="flex h-20 border-b border-border/20 last:border-b-0"
              >
                <div className="w-16 shrink-0 py-3 pr-3 text-right text-[10px] text-muted-foreground">
                  {label}
                </div>
                <div className="h-full flex-1 py-3 pr-3">
                  {hourEvents?.length ? (
                    <div className="flex h-full flex-col gap-2 overflow-hidden">
                      {hourEvents.map(evt => (
                        <div
                          key={evt.id}
                          className="overflow-hidden rounded-lg border border-border/30 bg-muted/10 px-3 py-2 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-sm font-medium leading-tight">
                              {evt.title}
                            </p>
                            <Badge
                              variant="secondary"
                              className="h-5 max-w-[7rem] shrink-0 truncate px-2 text-[10px]"
                            >
                              {sourceLabels[evt.source] ?? 'Calendar'}
                            </Badge>
                          </div>
                          <p className="mt-1 truncate text-[11px] text-muted-foreground">
                            {formatTimeRange(evt)}
                          </p>
                          {evt.location ? (
                            <p className="truncate text-[11px] text-muted-foreground">
                              {evt.location}
                            </p>
                          ) : evt.calendarName ? (
                            <p className="truncate text-[11px] text-muted-foreground">
                              {evt.calendarName}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function generateMonthDays(
  year: number,
  month: number,
  options?: { fillSixWeeks?: boolean; includeOutsideMonth?: boolean },
): CalendarDay[] {
  const today = new Date();
  const fillSixWeeks = options?.fillSixWeeks ?? false;
  const includeOutsideMonth = options?.includeOutsideMonth ?? true;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days: CalendarDay[] = [];

  if (includeOutsideMonth) {
    const prevMonth = new Date(year, month, 0);
    for (let i = startPadding - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month - 1, day),
      });
    }
  }

  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    days.push({
      day,
      isCurrentMonth: true,
      isToday,
      date,
    });
  }

  if (includeOutsideMonth) {
    if (fillSixWeeks) {
      const remaining = 42 - days.length;
      for (let day = 1; day <= remaining; day++) {
        days.push({
          day,
          isCurrentMonth: false,
          date: new Date(year, month + 1, day),
        });
      }
    } else {
      const remainder = days.length % 7;
      const remaining = remainder === 0 ? 0 : 7 - remainder;
      for (let day = 1; day <= remaining; day++) {
        days.push({
          day,
          isCurrentMonth: false,
          date: new Date(year, month + 1, day),
        });
      }
    }
  }

  return days;
}

function generateWeekDays(date: Date): CalendarDay[] {
  const today = new Date();
  const days: CalendarDay[] = [];
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    days.push({
      day: d.getDate(),
      isCurrentMonth: d.getMonth() === date.getMonth(),
      isToday,
      date: d,
    });
  }

  return days;
}

function getMonthName(month: number): string {
  return new Date(2000, month).toLocaleString('default', { month: 'long' });
}

function formatDateHeader(date: Date, view: ViewType): string {
  if (view === 'Year') {
    return date.getFullYear().toString();
  }
  if (view === 'Month') {
    return `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
  }
  if (view === 'Week') {
    const endOfWeek = new Date(date);
    endOfWeek.setDate(date.getDate() + 6 - date.getDay());
    if (date.getMonth() === endOfWeek.getMonth()) {
      return `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
    }
    return `${getMonthName(date.getMonth())} - ${getMonthName(endOfWeek.getMonth())} ${date.getFullYear()}`;
  }
  // Day
  return date.toLocaleDateString('default', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Generate array of dates for scrolling (±12 months from current)
function generateScrollDates(centerDate: Date, view: ViewType): Date[] {
  const dates: Date[] = [];
  const range =
    view === 'Month' ? 260 : view === 'Year' ? 2 : view === 'Week' ? 104 : 730;

  if (view === 'Year') {
    for (let i = -range; i <= range; i++) {
      dates.push(new Date(centerDate.getFullYear() + i, 0, 1));
    }
  } else if (view === 'Month') {
    const base = startOfWeek(centerDate);
    for (let i = -range; i <= range; i++) {
      dates.push(addDays(base, i * 7));
    }
  } else if (view === 'Week') {
    const startOfWeek = new Date(centerDate);
    startOfWeek.setDate(centerDate.getDate() - centerDate.getDay());
    for (let i = -range; i <= range; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i * 7);
      dates.push(d);
    }
  } else {
    // Day view
    for (let i = -range; i <= range; i++) {
      const d = new Date(centerDate);
      d.setDate(centerDate.getDate() + i);
      dates.push(d);
    }
  }

  return dates;
}

function MonthView({
  weekStart,
  focusDate,
  monthBlend,
  selectedDate,
  onSelectDate,
  eventsByDate,
  hideDayNumberCols = 0,
}: {
  weekStart: Date;
  focusDate: Date;
  monthBlend?: Record<string, number> | null;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  eventsByDate?: Map<string, CalendarEvent[]>;
  hideDayNumberCols?: number;
}) {
  const focusYear = focusDate.getFullYear();
  const focusMonth = focusDate.getMonth();
  const focusKey = monthKey(focusDate);

  const today = useMemo(() => new Date(), []);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const key = dateKey(date);
      const events = eventsByDate?.get(key);

      return {
        date,
        day: date.getDate(),
        isToday: isSameDay(date, today),
        isFocusedMonth:
          date.getFullYear() === focusYear && date.getMonth() === focusMonth,
        focusIntensity: monthBlend ? (monthBlend[monthKey(date)] ?? 0) : null,
        events,
      };
    });
  }, [eventsByDate, focusMonth, focusYear, monthBlend, today, weekStart]);

  const eventPalette = [
    'bg-rose-400',
    'bg-amber-400',
    'bg-emerald-400',
    'bg-sky-400',
    'bg-violet-400',
  ];

  return (
    <div className="grid h-36 grid-cols-7 gap-x-0">
      {days.map((day, index) => {
        const isSelected = selectedDate
          ? isSameDay(day.date, selectedDate)
          : false;
        const isActiveMonthDay = monthKey(day.date) === focusKey;
        const monthIndex = day.date.getFullYear() * 12 + day.date.getMonth();
        const isAltMonth = monthIndex % 2 === 1;
        const baseBg = isAltMonth ? 'bg-muted/10' : 'bg-background';
        const rawWeight = day.focusIntensity ?? (isActiveMonthDay ? 1 : 0);
        const weight = Math.max(0, Math.min(1, rawWeight));
        const eased = weight * weight * (3 - 2 * weight);
        const isMuted = !isActiveMonthDay;
        const dayEvents = day.events;
        const eventsOpacity = 0.55 + eased * 0.45;
        const dotOpacity = 0.6 + eased * 0.4;
        const labelAlpha = 0.5 + eased * 0.5;
        const filterGray = 1 - eased;
        const filterSaturate = 0.1 + eased * 0.9;
        const filterBrightness = 0.78 + eased * 0.22;
        const eventFilter = `grayscale(${filterGray}) saturate(${filterSaturate}) brightness(${filterBrightness})`;
        const eventTransition =
          'opacity 150ms ease, filter 150ms ease, color 150ms ease';

        return (
          <button
            key={`${day.date.toISOString()}-${index}`}
            type="button"
            onClick={() => onSelectDate(day.date)}
            aria-label={day.date.toDateString()}
            className={`relative flex h-full w-full min-h-0 flex-col gap-1 ${baseBg} px-2 py-1 text-left text-xs transition-colors duration-100 border ${
              isMuted ? 'text-muted-foreground/70' : 'text-foreground'
            } ${isMuted ? 'border-transparent' : 'border-border/20'} ${
              isSelected
                ? 'ring-2 ring-emerald-500/60 ring-inset bg-emerald-500/10'
                : 'hover:bg-muted/20'
            } ${day.isToday && !isSelected ? 'bg-green-500/10' : ''}`}
          >
            <div className="flex items-start justify-between">
              <span
                className={`text-xs font-semibold transition-colors duration-100 ${
                  day.isToday
                    ? 'text-emerald-500'
                    : isMuted
                      ? 'text-muted-foreground/70'
                      : 'text-foreground'
                }`}
              >
                <span
                  className={
                    hideDayNumberCols > 0 && index < hideDayNumberCols
                      ? 'opacity-0'
                      : undefined
                  }
              >
                {day.day}
                </span>
              </span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
              {dayEvents?.slice(0, 3).map((event, evtIndex) => (
                <div
                  key={`${day.date.toISOString()}-${event.id}`}
                  className="flex items-center gap-1 text-[10px] transition-opacity duration-150"
                  style={{
                    opacity: eventsOpacity,
                    color: `rgb(255 255 255 / ${labelAlpha})`,
                    filter: eventFilter,
                    transition: eventTransition,
                  }}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition-opacity duration-150 ${
                      eventPalette[evtIndex % eventPalette.length]
                    }`}
                    style={{
                      opacity: dotOpacity,
                      filter: eventFilter,
                      transition: 'opacity 150ms ease, filter 150ms ease',
                    }}
                  />
                  <span className="truncate">{event.title}</span>
                </div>
              ))}
              {dayEvents && dayEvents.length > 3 ? (
                <div
                  className="text-[10px] transition-opacity duration-150"
                  style={{
                    opacity: eventsOpacity,
                    color: `rgb(255 255 255 / ${labelAlpha})`,
                    filter: eventFilter,
                    transition: eventTransition,
                  }}
                >
                  +{dayEvents.length - 3} more
                </div>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function WeekView({
  date,
  selectedDate,
  onSelectDate,
}: {
  date: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}) {
  const days = useMemo(() => generateWeekDays(date), [date]);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="grid grid-cols-8 text-[10px] text-muted-foreground border-b border-border/30 pb-1 mb-0.5 shrink-0">
        <div></div>
        {days.map((day, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelectDate(day.date)}
            className={`text-center font-medium ${day.isToday ? 'text-emerald-500' : ''}`}
          >
            <div>{weekDays[i]}</div>
            <div
              className={`text-sm mx-auto flex items-center justify-center ${
                day.isToday
                  ? 'text-emerald-500 rounded-full w-6 h-6'
                  : selectedDate && isSameDay(day.date, selectedDate)
                    ? 'bg-emerald-500 text-white rounded-full w-6 h-6'
                    : ''
              }`}
            >
              {day.day}
            </div>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 border-l border-border/30">
          {hours.map(hour => (
            <div key={hour} className="contents">
              <div className="text-[9px] text-muted-foreground pr-1 text-right border-b border-border/30 h-10">
                {hour === 0
                  ? '12 AM'
                  : hour < 12
                    ? `${hour} AM`
                    : hour === 12
                      ? '12 PM'
                      : `${hour - 12} PM`}
              </div>
              {days.map((day, dayIndex) => (
                <button
                  key={`${hour}-${dayIndex}`}
                  type="button"
                  onClick={() => onSelectDate(day.date)}
                  className={`border-r border-b border-border/30 h-10 ${
                    day.isToday ? 'bg-emerald-500/5' : ''
                  } ${
                    selectedDate && isSameDay(day.date, selectedDate)
                      ? 'bg-emerald-500/10'
                      : ''
                  } hover:bg-muted/10 transition-colors`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div aria-hidden="true" className="flex-1" />
    </div>
  );
}

function DayView({ date }: { date: Date }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="text-center border-b border-border/30 pb-2 mb-2 shrink-0">
        <div className="text-[10px] text-muted-foreground font-medium">
          {weekDays[date.getDay()]}
        </div>
        <div
          className={`text-2xl font-semibold ${
            isToday
              ? 'bg-emerald-500 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto'
              : ''
          }`}
        >
          {date.getDate()}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="border-l border-border/30">
          {hours.map(hour => (
            <div key={hour} className="flex border-b border-border/30 h-14">
              <div className="text-[9px] text-muted-foreground pr-2 text-right w-12 shrink-0">
                {hour === 0
                  ? '12 AM'
                  : hour < 12
                    ? `${hour} AM`
                    : hour === 12
                      ? '12 PM'
                      : `${hour - 12} PM`}
              </div>
              <div
                className={`flex-1 border-r border-border/30 ${isToday ? 'bg-emerald-500/5' : ''}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function YearView({ date }: { date: Date }) {
  const months = Array.from({ length: 12 }, (_, i) => i);
  const today = new Date();

  return (
    <div className="h-full grid grid-cols-4 gap-3 p-2 overflow-auto">
      {months.map(month => {
        const days = generateMonthDays(date.getFullYear(), month, {
          fillSixWeeks: true,
        });
        const isCurrentMonth =
          month === today.getMonth() &&
          date.getFullYear() === today.getFullYear();

        return (
          <div
            key={month}
            className={`border border-border/30 rounded-lg p-2 ${
              isCurrentMonth ? 'ring-2 ring-emerald-500/50' : ''
            }`}
          >
            <div className="text-xs font-medium mb-1">
              {getMonthName(month)}
            </div>
            <div className="grid grid-cols-7 gap-px text-[8px]">
              {weekDays.map(d => (
                <div key={d} className="text-center text-muted-foreground">
                  {d[0]}
                </div>
              ))}
              {days.slice(0, 42).map((day, i) => (
                <div
                  key={i}
                  className={`text-center py-0.5 ${
                    !day.isCurrentMonth ? 'text-muted-foreground/50' : ''
                  } ${day.isToday ? 'bg-emerald-500 text-white rounded' : ''}`}
                >
                  {day.day}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CalendarPage() {
  const [currentView, setCurrentView] = useState<ViewType>('Month');
  const [currentDate, setCurrentDate] = useState(() => startOfWeek(new Date()));
  const [activeMonthDate, setActiveMonthDate] = useState<Date>(() =>
    addDays(startOfWeek(new Date()), 3),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    () => new Date(),
  );
  const [isDayPanelOpen, setIsDayPanelOpen] = useState(false);
  const [useMockEvents, setUseMockEvents] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [eventsStatus, setEventsStatus] = useState<
    'idle' | 'loading' | 'ok' | 'error'
  >('idle');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [monthBlend, setMonthBlend] = useState<Record<string, number> | null>(
    null,
  );
  const monthBlendRafRef = useRef<number | null>(null);
  const activeMonthKeyRef = useRef<string>(
    monthKey(addDays(startOfWeek(new Date()), 3)),
  );
  const scrollGestureStartRef = useRef<number | null>(null);
  const scrollGestureStartTimeRef = useRef<number | null>(null);
  const scrollGestureLastTopRef = useRef<number | null>(null);
  const scrollGestureLastTimeRef = useRef<number | null>(null);
  const scrollGestureMaxVelocityRef = useRef(0);
  const scrollGestureMaxDeltaRef = useRef(0);
  const didInitialScrollRef = useRef(false);
  const viewContainerKey = useMemo(() => `view:${currentView}`, [currentView]);
  const isMonthView = currentView === 'Month';

  const [monthDividerSegments, setMonthDividerSegments] = useState<
    Array<{
      key: string;
      top: number;
      height: number;
      startIndex: number;
      endIndex: number;
      outline: Array<
        | {
            id: string;
            orientation: 'h';
            top: number;
            leftPct: number;
            widthPct: number;
            emphasis?: boolean;
          }
        | {
            id: string;
            orientation: 'v';
            top: number;
            height: number;
            leftPct: number;
            emphasis?: boolean;
          }
      >;
    }>
  >([]);
  const [monthDividerContentHeight, setMonthDividerContentHeight] = useState(0);

  const monthBlendRef = useRef<Record<string, number> | null>(null);
  const monthTitleAnchorRef = useRef<HTMLDivElement | null>(null);
  const monthTitleStaticTextRef = useRef<HTMLSpanElement | null>(null);
  const [headerMonthSwap, setHeaderMonthSwap] = useState<{
    direction: 'down' | 'up';
    incomingKey: string;
    incomingLabel: string;
    progress: number;
  } | null>(null);
  const headerMonthSwapRef = useRef<{
    direction: 'down' | 'up';
    incomingKey: string;
    incomingLabel: string;
    progress: number;
  } | null>(null);
  const [monthTitleTransition, setMonthTitleTransition] = useState<{
    key: string;
    label: string;
    x: number;
    y: number;
    scale: number;
    progress: number;
  } | null>(null);
  const monthTitleTransitionRef = useRef<{
    key: string;
    x: number;
    y: number;
    scale: number;
    progress: number;
  } | null>(null);

  useEffect(() => {
    if (currentView !== 'Month' && monthBlend !== null) {
      setMonthBlend(null);
    }

    if (currentView !== 'Month' && monthBlendRafRef.current !== null) {
      if (typeof window !== 'undefined') {
        window.cancelAnimationFrame(monthBlendRafRef.current);
      }
      monthBlendRafRef.current = null;
    }
  }, [currentView, monthBlend]);

  const headerDate = useMemo(() => {
    return currentView === 'Month' ? activeMonthDate : currentDate;
  }, [activeMonthDate, currentDate, currentView]);

  const eventsRange = useMemo(() => {
    const baseDate = currentView === 'Month' ? activeMonthDate : currentDate;
    if (currentView === 'Year') {
      const start = new Date(baseDate.getFullYear(), 0, 1);
      const end = new Date(baseDate.getFullYear() + 1, 0, 1);
      return { start, end };
    }
    if (currentView === 'Month') {
      const start = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth() - 1,
        1,
      );
      const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 2, 1);
      return { start, end };
    }
    if (currentView === 'Week') {
      const start = startOfWeek(baseDate);
      const end = addDays(start, 7);
      return { start, end };
    }
    const start = new Date(baseDate);
    start.setHours(0, 0, 0, 0);
    const end = addDays(start, 1);
    return { start, end };
  }, [activeMonthDate, currentDate, currentView]);

  const eventsRangeKey = useMemo(
    () => `${eventsRange.start.toISOString()}-${eventsRange.end.toISOString()}`,
    [eventsRange.end, eventsRange.start],
  );

  const mockEvents = useMemo(() => {
    if (!useMockEvents) return [] as CalendarEvent[];
    return generateMockEvents(eventsRange.start, eventsRange.end);
  }, [eventsRange.end, eventsRange.start, useMockEvents]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of calendarEvents) {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
        continue;
      const cursor = new Date(start);
      cursor.setHours(0, 0, 0, 0);
      const last = new Date(end);
      last.setHours(0, 0, 0, 0);
      while (cursor <= last) {
        const key = dateKey(cursor);
        const existing = map.get(key);
        if (existing) {
          existing.push(event);
        } else {
          map.set(key, [event]);
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
    }

    return map;
  }, [calendarEvents]);

  const eventsByDateMerged = useMemo(() => {
    if (!useMockEvents) return eventsByDate;

    const merged = new Map<string, CalendarEvent[]>();
    for (const [k, v] of eventsByDate.entries()) {
      merged.set(k, [...v]);
    }
    for (const event of mockEvents) {
      const start = new Date(event.startTime);
      if (Number.isNaN(start.getTime())) continue;
      const key = dateKey(start);
      const existing = merged.get(key);
      if (existing) {
        existing.push(event);
      } else {
        merged.set(key, [event]);
      }
    }
    for (const list of merged.values()) {
      list.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
    }
    return merged;
  }, [eventsByDate, mockEvents, useMockEvents]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const loadEvents = async () => {
      setEventsStatus('loading');
      try {
        const res = await fetch(
          `/api/calendar/events?start=${encodeURIComponent(
            eventsRange.start.toISOString(),
          )}&end=${encodeURIComponent(eventsRange.end.toISOString())}`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          throw new Error(`Calendar fetch failed: ${res.status}`);
        }

        const data = (await res.json().catch(() => null)) as {
          events?: CalendarEvent[];
        } | null;
        const nextEvents = Array.isArray(data?.events) ? data?.events : [];

        if (isActive) {
          setCalendarEvents(nextEvents ?? []);
          setEventsStatus('ok');
        }
      } catch (error) {
        if (!isActive || controller.signal.aborted) return;
        console.error('Failed to load calendar events:', error);
        setEventsStatus('error');
      }
    };

    void loadEvents();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [eventsRangeKey]);

  useEffect(() => {
    if (currentView !== 'Month') return;
    const nextKey = monthKey(activeMonthDate);
    activeMonthKeyRef.current = nextKey;
    if (monthBlend === null) {
      setMonthBlend({ [nextKey]: 1 });
    }
  }, [activeMonthDate, currentView, monthBlend]);

  const scrollDates = useMemo(
    () => generateScrollDates(new Date(), currentView),
    [currentView],
  );

  const monthStartWeekIndexByKey = useMemo(() => {
    if (currentView !== 'Month') return {} as Record<string, number>;
    const map: Record<string, number> = {};
    for (let i = 0; i < scrollDates.length; i++) {
      const wk = scrollDates[i];
      if (!wk) continue;
      const k = monthStartKeyForWeek(wk);
      if (k && map[k] === undefined) {
        map[k] = i;
      }
    }
    return map;
  }, [currentView, scrollDates]);

  const monthLabelWeekIndexByKey = useMemo(() => {
    if (currentView !== 'Month') return {} as Record<string, number>;
    const map: Record<string, number> = {};
    for (let i = 0; i < scrollDates.length; i++) {
      const wk = scrollDates[i];
      if (!wk) continue;
      const k = monthLabelKeyForWeek(wk);
      if (k && map[k] === undefined) {
        map[k] = i;
      }
    }
    return map;
  }, [currentView, scrollDates]);

  const monthRowRangeByKey = useMemo(() => {
    if (currentView !== 'Month')
      return {} as Record<string, { startIndex: number; endIndex: number }>;
    const map: Record<string, { startIndex: number; endIndex: number }> = {};
    for (let i = 0; i < scrollDates.length; i++) {
      const wk = scrollDates[i];
      if (!wk) continue;
      for (let c = 0; c < 7; c++) {
        const key = monthKey(addDays(wk, c));
        const existing = map[key];
        if (!existing) {
          map[key] = { startIndex: i, endIndex: i };
        } else {
          if (i < existing.startIndex) existing.startIndex = i;
          if (i > existing.endIndex) existing.endIndex = i;
        }
      }
    }
    return map;
  }, [currentView, scrollDates]);

  // Find current index based on currentDate
  const currentIndex = useMemo(() => {
    return scrollDates.findIndex(d => {
      if (currentView === 'Year') {
        return d.getFullYear() === currentDate.getFullYear();
      }
      if (currentView === 'Month') {
        const weekStart = startOfWeek(currentDate);
        return (
          d.getFullYear() === weekStart.getFullYear() &&
          d.getMonth() === weekStart.getMonth() &&
          d.getDate() === weekStart.getDate()
        );
      }
      if (currentView === 'Week') {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        return (
          d.getFullYear() === startOfWeek.getFullYear() &&
          d.getMonth() === startOfWeek.getMonth() &&
          d.getDate() === startOfWeek.getDate()
        );
      }
      // Day
      return (
        d.getFullYear() === currentDate.getFullYear() &&
        d.getMonth() === currentDate.getMonth() &&
        d.getDate() === currentDate.getDate()
      );
    });
  }, [currentDate, currentView, scrollDates]);

  const getSnapTargets = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return [] as HTMLElement[];
    return Array.from(
      container.querySelectorAll('[data-snap="1"]'),
    ) as HTMLElement[];
  }, []);

  useEffect(() => {
    if (currentView !== 'Month') {
      if (monthDividerSegments.length) setMonthDividerSegments([]);
      if (monthDividerContentHeight !== 0) setMonthDividerContentHeight(0);
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) return;

    let raf = 0;
    const compute = () => {
      if (!scrollContainerRef.current) return;
      const targets = getSnapTargets();
      if (!targets.length) return;

      const entries = Object.entries(monthRowRangeByKey)
        .map(([key, range]) => ({
          key,
          startIndex: range.startIndex,
          endIndex: range.endIndex,
        }))
        .filter(
          e => Number.isFinite(e.startIndex) && Number.isFinite(e.endIndex),
        )
        .sort((a, b) => {
          const [ay, am] = a.key.split('-').map(Number);
          const [by, bm] = b.key.split('-').map(Number);
          if (ay !== by) return ay - by;
          return am - bm;
        });

      if (!entries.length) return;

      const lastTarget = targets[targets.length - 1];
      if (!lastTarget) return;
      const contentHeight = lastTarget.offsetTop + lastTarget.offsetHeight;

      const segs: Array<{
        key: string;
        top: number;
        height: number;
        startIndex: number;
        endIndex: number;
        outline: Array<
          | {
              id: string;
              orientation: 'h';
              top: number;
              leftPct: number;
              widthPct: number;
              emphasis?: boolean;
            }
          | {
              id: string;
              orientation: 'v';
              top: number;
              height: number;
              leftPct: number;
              emphasis?: boolean;
            }
        >;
      }> = [];
      for (let i = 0; i < entries.length; i++) {
        const startIndex = entries[i]!.startIndex;
        const resolvedEndIndex = entries[i]!.endIndex + 1;
        const startTarget = targets[startIndex];
        if (!startTarget) continue;

        const startTop = startTarget.offsetTop;
        const endRowTarget =
          targets[Math.min(targets.length - 1, resolvedEndIndex - 1)];
        const endTop = endRowTarget
          ? endRowTarget.offsetTop + endRowTarget.offsetHeight
          : lastTarget.offsetTop + lastTarget.offsetHeight;
        const height = Math.max(1, endTop - startTop + 1);

        const cellW = 100 / 7;
        const outline: Array<
          | {
              id: string;
              orientation: 'h';
              top: number;
              leftPct: number;
              widthPct: number;
            }
          | {
              id: string;
              orientation: 'v';
              top: number;
              height: number;
              leftPct: number;
              emphasis?: boolean;
            }
        > = [];

        const addH = (
          rowTop: number,
          c0: number,
          c1: number,
          atBottom: boolean,
        ) => {
          const leftPct = c0 * cellW;
          const widthPct = (c1 - c0 + 1) * cellW;
          outline.push({
            id: `${entries[i]!.key}:h:${rowTop}:${c0}:${c1}:${atBottom ? 'b' : 't'}`,
            orientation: 'h',
            top: rowTop,
            leftPct,
            widthPct,
          });
        };

        const addV = (
          topPx: number,
          heightPx: number,
          xColBoundary: number,
          emphasis: boolean,
        ) => {
          outline.push({
            id: `${entries[i]!.key}:v:${topPx}:${heightPx}:${xColBoundary}`,
            orientation: 'v',
            top: topPx,
            height: heightPx,
            leftPct: xColBoundary * cellW,
            emphasis,
          });
        };

        for (
          let rowIndex = startIndex;
          rowIndex < resolvedEndIndex;
          rowIndex++
        ) {
          const wk = scrollDates[rowIndex];
          const t = targets[rowIndex];
          if (!wk || !t) continue;

          const rowTop = t.offsetTop - startTop;
          const rowH = t.offsetHeight;

          const topMarks = new Array<boolean>(7).fill(false);
          const bottomMarks = new Array<boolean>(7).fill(false);

          const leftMarks = new Array<boolean>(8).fill(false);
          const rightMarks = new Array<boolean>(8).fill(false);
          const vEmphasis = new Array<boolean>(8).fill(false);

          for (let c = 0; c < 7; c++) {
            const d = addDays(wk, c);
            const inMonth = monthKey(d) === entries[i]!.key;
            if (!inMonth) continue;

            const upWk = rowIndex > 0 ? scrollDates[rowIndex - 1] : null;
            const upInMonth = upWk
              ? monthKey(addDays(upWk, c)) === entries[i]!.key
              : false;
            const downWk =
              rowIndex + 1 < scrollDates.length
                ? scrollDates[rowIndex + 1]
                : null;
            const downInMonth = downWk
              ? monthKey(addDays(downWk, c)) === entries[i]!.key
              : false;

            const leftInMonth =
              c > 0 ? monthKey(addDays(wk, c - 1)) === entries[i]!.key : false;
            const rightInMonth =
              c < 6 ? monthKey(addDays(wk, c + 1)) === entries[i]!.key : false;

            if (!upInMonth) topMarks[c] = true;
            if (!downInMonth) bottomMarks[c] = true;
            if (!leftInMonth) {
              leftMarks[c] = true;
              if (d.getDate() === 1) vEmphasis[c] = true;
            }
            if (!rightInMonth) rightMarks[c + 1] = true;
          }

          const flushRuns = (
            marks: boolean[],
            y: number,
            atBottom: boolean,
          ) => {
            let runStart = -1;
            for (let c = 0; c < 7; c++) {
              if (marks[c]) {
                if (runStart === -1) runStart = c;
              } else if (runStart !== -1) {
                addH(y, runStart, c - 1, atBottom);
                runStart = -1;
              }
            }
            if (runStart !== -1) {
              addH(y, runStart, 6, atBottom);
            }
          };

          flushRuns(topMarks, rowTop, false);
          flushRuns(bottomMarks, rowTop + rowH, true);

          const addVMarks = (marks: boolean[], emphasisMarks: boolean[]) => {
            for (let b = 0; b <= 7; b++) {
              if (!marks[b]) continue;
              addV(rowTop, rowH, b, emphasisMarks[b] ?? false);
            }
          };

          addVMarks(leftMarks, vEmphasis);
          addVMarks(rightMarks, vEmphasis);
        }

        const vByX = new Map<
          string,
          {
            leftPct: number;
            emphasis: boolean;
            list: Array<{ top: number; height: number }>;
          }
        >();
        const merged: typeof outline = [];
        for (const segItem of outline) {
          if (segItem.orientation === 'h') {
            merged.push(segItem);
          } else {
            const k = `${segItem.leftPct}:${segItem.emphasis ? '1' : '0'}`;
            const entry = vByX.get(k);
            if (entry) {
              entry.list.push({ top: segItem.top, height: segItem.height });
            } else {
              vByX.set(k, {
                leftPct: segItem.leftPct,
                emphasis: segItem.emphasis ?? false,
                list: [{ top: segItem.top, height: segItem.height }],
              });
            }
          }
        }
        for (const entry of vByX.values()) {
          entry.list.sort((a, b) => a.top - b.top);
          let cur = entry.list[0];
          for (let j = 1; j < entry.list.length; j++) {
            const nxt = entry.list[j]!;
            const end = cur!.top + cur!.height;
            if (Math.abs(nxt.top - end) <= 1) {
              cur = { top: cur!.top, height: end - cur!.top + nxt.height };
            } else {
              merged.push({
                id: `${entries[i]!.key}:v:${cur!.top}:${cur!.height}:${entry.leftPct}:${entry.emphasis ? '1' : '0'}`,
                orientation: 'v',
                top: cur!.top,
                height: cur!.height,
                leftPct: entry.leftPct,
                emphasis: entry.emphasis,
              });
              cur = nxt;
            }
          }
          if (cur) {
            merged.push({
              id: `${entries[i]!.key}:v:${cur.top}:${cur.height}:${entry.leftPct}:${entry.emphasis ? '1' : '0'}`,
              orientation: 'v',
              top: cur.top,
              height: cur.height,
              leftPct: entry.leftPct,
              emphasis: entry.emphasis,
            });
          }
        }

        segs.push({
          key: entries[i]!.key,
          top: startTop,
          height,
          startIndex,
          endIndex: resolvedEndIndex,
          outline: merged,
        });
      }

      setMonthDividerContentHeight(contentHeight);
      setMonthDividerSegments(segs);
    };

    raf = window.requestAnimationFrame(compute);
    window.addEventListener('resize', compute);

    return () => {
      window.removeEventListener('resize', compute);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [
    currentView,
    getSnapTargets,
    monthDividerContentHeight,
    monthDividerSegments.length,
    monthRowRangeByKey,
  ]);

  const getNearestIndex = useCallback(
    (scrollTop: number) => {
      const targets = getSnapTargets();
      if (!targets.length) return -1;

      if (currentView === 'Month') {
        // Index of the week row currently at (or above) the top edge.
        let idx = 0;
        for (let i = 0; i < targets.length; i++) {
          const t = targets[i]!;
          if (t.offsetTop <= scrollTop) {
            idx = i;
          } else {
            break;
          }
        }
        return idx;
      }

      const container = scrollContainerRef.current;
      const containerCenter =
        (container ? container.clientHeight : 0) * 0.5 + scrollTop;

      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i]!;
        const targetCenter = target.offsetTop + target.offsetHeight * 0.5;
        const distance = Math.abs(targetCenter - containerCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = i;
        }
      }
      return bestIndex;
    },
    [currentView, getSnapTargets],
  );

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior) => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const targets = getSnapTargets();
      const target = targets[index];
      if (!target) return;

      const top =
        currentView === 'Month'
          ? Math.round(target.offsetTop)
          : target.offsetTop +
            target.offsetHeight * 0.5 -
            container.clientHeight * 0.5;
      container.scrollTo({ top: Math.max(0, top), behavior });
    },
    [currentView, getSnapTargets],
  );

  const lastViewRef = useRef<ViewType>(currentView);
  useEffect(() => {
    if (lastViewRef.current !== currentView) {
      lastViewRef.current = currentView;
      if (scrollContainerRef.current && currentIndex >= 0) {
        scrollToIndex(currentIndex, 'auto');
      }
    }
  }, [currentIndex, currentView, scrollToIndex]);

  useEffect(() => {
    if (didInitialScrollRef.current) return;
    if (!scrollContainerRef.current) return;
    if (currentIndex < 0) return;
    didInitialScrollRef.current = true;
    scrollToIndex(currentIndex, 'auto');
  }, [currentIndex, scrollToIndex]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const containerNow = scrollContainerRef.current;
    const now = Date.now();
    // During programmatic snapping (`isScrolling`), we still want the month-title/label visuals
    // to update; we just skip gesture tracking + debounced snapping.
    if (!isScrolling) {
    if (scrollGestureStartRef.current === null) {
      scrollGestureStartRef.current = containerNow.scrollTop;
      scrollGestureStartTimeRef.current = now;
      scrollGestureLastTopRef.current = containerNow.scrollTop;
      scrollGestureLastTimeRef.current = now;
      scrollGestureMaxVelocityRef.current = 0;
      scrollGestureMaxDeltaRef.current = 0;
    } else {
      const delta = Math.abs(
        containerNow.scrollTop - scrollGestureStartRef.current,
      );
      if (delta > scrollGestureMaxDeltaRef.current) {
        scrollGestureMaxDeltaRef.current = delta;
      }

      const lastTop = scrollGestureLastTopRef.current;
      const lastTime = scrollGestureLastTimeRef.current;
      if (lastTop !== null && lastTime !== null) {
        const dt = Math.max(1, now - lastTime);
        const v = Math.abs(containerNow.scrollTop - lastTop) / dt;
        if (v > scrollGestureMaxVelocityRef.current) {
          scrollGestureMaxVelocityRef.current = v;
        }
      }
      scrollGestureLastTopRef.current = containerNow.scrollTop;
      scrollGestureLastTimeRef.current = now;
      }
    }

    if (currentView === 'Month') {
      if (monthBlendRafRef.current !== null) {
        // already scheduled
      } else if (typeof window !== 'undefined') {
        monthBlendRafRef.current = window.requestAnimationFrame(() => {
          monthBlendRafRef.current = null;
          const container = scrollContainerRef.current;
          if (!container) return;
          const targets = getSnapTargets();
          if (targets.length === 0) return;

          const top = container.scrollTop;
          const bottom = top + container.clientHeight;
          const monthVisible: Record<string, number> = {};
          let totalVisible = 0;

          for (let i = 0; i < targets.length; i++) {
            const t = targets[i]!;
            const tTop = t.offsetTop;
            const tBottom = tTop + t.offsetHeight;
            if (tBottom <= top) continue;
            if (tTop >= bottom) break;

            const visible = Math.min(tBottom, bottom) - Math.max(tTop, top);
            if (visible <= 0) continue;

            const weekStart = scrollDates[i];
            if (!weekStart) continue;
            for (let j = 0; j < 7; j++) {
              const key = monthKey(addDays(weekStart, j));
              monthVisible[key] = (monthVisible[key] ?? 0) + visible / 7;
              totalVisible += visible / 7;
            }
          }

          if (totalVisible <= 0) return;

          const entries = Object.entries(monthVisible)
            .map(([k, v]) => [k, v / totalVisible] as const)
            .sort((a, b) => b[1] - a[1]);

          const firstEntry = entries[0];
          if (!firstEntry) return;
          const secondEntry = entries.length > 1 ? entries[1] : undefined;

          const w1 = firstEntry[1];
          const w2 = secondEntry ? secondEntry[1] : 0;
          const sum = w1 + w2;
          const n1 = sum > 0 ? w1 / sum : 1;
          const n2 = sum > 0 ? w2 / sum : 0;

          const blend: Record<string, number> = {
            [firstEntry[0]]: n1,
          };
          if (secondEntry) {
            blend[secondEntry[0]] = n2;
          }
          setMonthBlend(blend);
          monthBlendRef.current = blend;

          const parseKey = (k: string) => {
            const [yy, mm] = k.split('-').map(Number);
            if (!Number.isFinite(yy) || !Number.isFinite(mm)) return null;
            return { y: yy, m: mm };
          };

          const dominantKey = firstEntry[0];
          if (scrollContainerRef.current && monthTitleAnchorRef.current) {
            // Measure the title position from a non-transformed (hidden) span so the
            // ongoing header push animation doesn't skew the target rect.
            const anchorRect = monthTitleStaticTextRef.current
              ? monthTitleStaticTextRef.current.getBoundingClientRect()
              : monthTitleAnchorRef.current.getBoundingClientRect();

            const activeKeyNow = activeMonthKeyRef.current;
            const activeParsed = parseKey(activeKeyNow);
          const monthDiff = (a: string, b: string) => {
            const pa = parseKey(a);
            const pb = parseKey(b);
            if (!pa || !pb) return 0;
            return (pb.y - pa.y) * 12 + (pb.m - pa.m);
          };

            // Decouple:
            // - The in-grid month label ("floating label") starts moving toward the title at ~1 week away.
            // - The header title should only start getting pushed/fading when the label is very close (~12px).
            const weekRowH = targets[0]?.offsetHeight ?? 144;
            const labelMoveRangePx = weekRowH; // start moving ~1 week away
            const titlePushRangePx = 12; // start pushing header only when very close

            // Prefer symmetric swap based on the adjacent month labels relative to the title.
            let didSwap = false;
            if (activeParsed) {
              const nextKey = monthKey(new Date(activeParsed.y, activeParsed.m + 1, 1));
              const prevKey = monthKey(new Date(activeParsed.y, activeParsed.m - 1, 1));

              const nextEl = scrollContainerRef.current.querySelector(
                `[data-month-label-key="${nextKey}"]`,
              ) as HTMLElement | null;
              const prevEl = scrollContainerRef.current.querySelector(
                `[data-month-label-key="${prevKey}"]`,
              ) as HTMLElement | null;

              const nextRect = nextEl?.getBoundingClientRect() ?? null;
              const prevRect = prevEl?.getBoundingClientRect() ?? null;

              // When scrolling "forward" (down the timeline), the next month label approaches from below.
              const distNext =
                nextRect ? nextRect.top - anchorRect.top : null; // >= 0 when below
              // When scrolling "back" (up the timeline), the previous month label approaches from above.
              // Use the label's bottom edge so the threshold is symmetric with the "next" case (top edge).
              const distPrev =
                prevRect ? anchorRect.top - prevRect.bottom : null; // >= 0 when above

            const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
              const smoothstep = (t: number) => t * t * (3 - 2 * t);

              let nextLabelProgress = 0;
              if (
                distNext !== null &&
                distNext >= 0 &&
                distNext <= labelMoveRangePx
              ) {
                nextLabelProgress = smoothstep(
                  clamp01(1 - distNext / labelMoveRangePx),
                );
              }
              let prevLabelProgress = 0;
              if (
                distPrev !== null &&
                distPrev >= 0 &&
                distPrev <= labelMoveRangePx
              ) {
                prevLabelProgress = smoothstep(
                  clamp01(1 - distPrev / labelMoveRangePx),
                );
              }

              // Choose a direction (they shouldn't overlap much; pick the stronger one if they do).
              const direction: 'down' | 'up' | null =
                nextLabelProgress > 0 && nextLabelProgress >= prevLabelProgress
                ? 'down'
                  : prevLabelProgress > 0
                    ? 'up'
              : null;

              if (direction === 'down') {
                const incomingKey = nextKey;
                const incomingLabel = formatDateHeader(
                  new Date(activeParsed.y, activeParsed.m + 1, 1),
                  'Month',
                );

                // Single source of truth for swap progress: use the label's move progress
                // (accelerated) so the header push stays in sync and doesn't start early/late.
                const swapP = clamp01(nextLabelProgress * 1.35);
                const nextSwap = {
                  direction,
                  incomingKey,
                  incomingLabel,
                  progress: swapP,
                } as const;

                const prevSwap = headerMonthSwapRef.current;
                const shouldUpdate =
                  !prevSwap ||
                  prevSwap.incomingKey !== nextSwap.incomingKey ||
                  prevSwap.direction !== nextSwap.direction ||
                  Math.abs(prevSwap.progress - nextSwap.progress) > 0.01;
                if (shouldUpdate) {
                  headerMonthSwapRef.current = nextSwap;
                  setHeaderMonthSwap(nextSwap);
                }

                // Animate the in-grid month label into the header title position.
                if (nextEl) {
                  const nextTextEl = nextEl.querySelector(
                    '[data-month-label-text="1"]',
              ) as HTMLElement | null;
                  const fromRect = (nextTextEl ?? nextEl).getBoundingClientRect();
                  const raw = 1 - (distNext ?? labelMoveRangePx) / labelMoveRangePx;
                  const eased = smoothstep(clamp01(raw));
                  // Move faster than scroll so it reaches the title earlier.
                  const p = clamp01(eased * 1.35);

                  const x = Math.round(
                    fromRect.left + (anchorRect.left - fromRect.left) * p,
                  );
                  const y = Math.round(
                    fromRect.top + (anchorRect.top - fromRect.top) * p,
                  );
                  const scale = 1;

                  const prev = monthTitleTransitionRef.current;
                  const shouldUpdate =
                    !prev ||
                    prev.key !== incomingKey ||
                    Math.abs(prev.x - x) > 0.5 ||
                    Math.abs(prev.y - y) > 0.5 ||
                    Math.abs(prev.scale - scale) > 0.01 ||
                    Math.abs(prev.progress - p) > 0.02;

                  if (shouldUpdate) {
                    monthTitleTransitionRef.current = {
                      key: incomingKey,
                      x,
                      y,
                      scale,
                      progress: p,
                    };
                    setMonthTitleTransition({
                      key: incomingKey,
                      label: incomingLabel,
                      x,
                      y,
                      scale,
                      progress: p,
                    });
                  }
                }

                // Finalize swap when the incoming label reaches/passes the title line.
                if (distNext !== null && distNext <= 0) {
                  const parsed = parseKey(incomingKey);
                  if (parsed) {
                    activeMonthKeyRef.current = incomingKey;
                    setActiveMonthDate(new Date(parsed.y, parsed.m, 1));
                    didSwap = true;
                    headerMonthSwapRef.current = null;
                    setHeaderMonthSwap(null);
                    monthTitleTransitionRef.current = null;
                    setMonthTitleTransition(null);
                  }
                }
              } else if (direction === 'up') {
                const incomingKey = prevKey;
                const incomingLabel = formatDateHeader(
                  new Date(activeParsed.y, activeParsed.m - 1, 1),
                  'Month',
                );
                const swapP = clamp01(prevLabelProgress * 1.35);
                const nextSwap = {
                  direction,
                  incomingKey,
                  incomingLabel,
                  progress: swapP,
                } as const;

                const prevSwap = headerMonthSwapRef.current;
                const shouldUpdate =
                  !prevSwap ||
                  prevSwap.incomingKey !== nextSwap.incomingKey ||
                  prevSwap.direction !== nextSwap.direction ||
                  Math.abs(prevSwap.progress - nextSwap.progress) > 0.01;
                if (shouldUpdate) {
                  headerMonthSwapRef.current = nextSwap;
                  setHeaderMonthSwap(nextSwap);
                }

                // Animate the in-grid month label into the header title position (reverse direction).
                if (prevEl) {
                  const prevTextEl = prevEl.querySelector(
                    '[data-month-label-text="1"]',
                  ) as HTMLElement | null;
                  const fromRect = (prevTextEl ?? prevEl).getBoundingClientRect();
                  const raw = 1 - (distPrev ?? labelMoveRangePx) / labelMoveRangePx;
                  const eased = smoothstep(clamp01(raw));
                  const p = clamp01(eased * 1.35);

                const x = Math.round(
                  fromRect.left + (anchorRect.left - fromRect.left) * p,
                );
                const y = Math.round(
                  fromRect.top + (anchorRect.top - fromRect.top) * p,
                );
                  const scale = 1;

                  const prev = monthTitleTransitionRef.current;
                  const shouldUpdate =
                    !prev ||
                    prev.key !== incomingKey ||
                    Math.abs(prev.x - x) > 0.5 ||
                    Math.abs(prev.y - y) > 0.5 ||
                    Math.abs(prev.scale - scale) > 0.01 ||
                    Math.abs(prev.progress - p) > 0.02;

                  if (shouldUpdate) {
                    monthTitleTransitionRef.current = {
                    key: incomingKey,
                    x,
                    y,
                    scale,
                      progress: p,
                    };
                    setMonthTitleTransition({
                      key: incomingKey,
                      label: incomingLabel,
                      x,
                      y,
                      scale,
                      progress: p,
                    });
                  }
                }

                // Finalize swap when the incoming label reaches/passes the title line.
                if (distPrev !== null && distPrev <= 0) {
                  const parsed = parseKey(incomingKey);
                  if (parsed) {
                    activeMonthKeyRef.current = incomingKey;
                    setActiveMonthDate(new Date(parsed.y, parsed.m, 1));
                    didSwap = true;
                    headerMonthSwapRef.current = null;
                    setHeaderMonthSwap(null);
                    monthTitleTransitionRef.current = null;
                    setMonthTitleTransition(null);
                  }
                }
              } else if (headerMonthSwapRef.current !== null) {
                headerMonthSwapRef.current = null;
                setHeaderMonthSwap(null);
                monthTitleTransitionRef.current = null;
                setMonthTitleTransition(null);
              }
            }

            // Fallback: if we've jumped far (fast scroll / snap) and the title is out of sync,
            // snap the active month to the dominant visible month.
            if (!didSwap && dominantKey !== activeMonthKeyRef.current) {
              if (Math.abs(monthDiff(activeMonthKeyRef.current, dominantKey)) > 1) {
                const parsed = parseKey(dominantKey);
                if (parsed) {
                  activeMonthKeyRef.current = dominantKey;
                  setActiveMonthDate(new Date(parsed.y, parsed.m, 1));
                }
              }
            }
          }

          // "Floating" month label transition: computed above into `monthTitleTransition`.
        });
      }
    }

    if (isScrolling) {
      return;
    }

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const debounceMs =
      currentView === 'Month' && scrollGestureMaxVelocityRef.current >= 1.2
        ? 900
        : 500;

    scrollTimeoutRef.current = setTimeout(() => {
      if (!scrollContainerRef.current) return;
      const container = scrollContainerRef.current;
      const index = getNearestIndex(container.scrollTop);
      if (index >= 0 && index < scrollDates.length) {
        setCurrentDate(scrollDates[index]);

        // Snap Month view to a week-row boundary (top-aligned) after scroll settles.
        if (currentView === 'Month') {
          // Always snap to week rows (not month boundaries).
            const targets = getSnapTargets();
            const top = container.scrollTop;
            const bottom = top + container.clientHeight;
            const aIndex = index;
            const bIndex = Math.min(index + 1, targets.length - 1);
            const a = targets[aIndex];
            const b = targets[bIndex];

            if (a) {
              const aTop = a.offsetTop;
              const aBottom = aTop + a.offsetHeight;
            const visibleFromTop = Math.max(0, Math.min(aBottom, bottom) - top);
              const visibleRatio = visibleFromTop / Math.max(1, a.offsetHeight);

              const snapIndex = visibleRatio >= 0.5 ? aIndex : bIndex;
              setIsScrolling(true);
              scrollToIndex(snapIndex, 'smooth');
              setTimeout(() => setIsScrolling(false), 650);
          }
        }
      }

      scrollGestureStartRef.current = null;
      scrollGestureStartTimeRef.current = null;
      scrollGestureLastTopRef.current = null;
      scrollGestureLastTimeRef.current = null;
      scrollGestureMaxVelocityRef.current = 0;
      scrollGestureMaxDeltaRef.current = 0;
    }, debounceMs);
  }, [
    currentView,
    getNearestIndex,
    getSnapTargets,
    isScrolling,
    monthStartWeekIndexByKey,
    scrollDates,
    scrollToIndex,
  ]);

  const goToToday = useCallback(() => {
    const today = new Date();
    const nextDate = currentView === 'Month' ? startOfWeek(today) : today;
    setCurrentDate(nextDate);

    if (currentView === 'Month') {
      const nextFocus = new Date(today.getFullYear(), today.getMonth(), 1);
      setActiveMonthDate(nextFocus);
      activeMonthKeyRef.current = monthKey(nextFocus);
      setMonthBlend(null);
    }

    if (scrollContainerRef.current) {
      setIsScrolling(true);
      const todayIndex = scrollDates.findIndex(d => {
        if (currentView === 'Year') {
          return d.getFullYear() === today.getFullYear();
        }
        if (currentView === 'Month') {
          const weekStart = startOfWeek(today);
          return (
            d.getFullYear() === weekStart.getFullYear() &&
            d.getMonth() === weekStart.getMonth() &&
            d.getDate() === weekStart.getDate()
          );
        }
        if (currentView === 'Week') {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          return (
            d.getFullYear() === startOfWeek.getFullYear() &&
            d.getMonth() === startOfWeek.getMonth() &&
            d.getDate() === startOfWeek.getDate()
          );
        }
        return (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        );
      });

      if (todayIndex >= 0) {
        scrollToIndex(todayIndex, 'smooth');
      }
      setTimeout(() => setIsScrolling(false), 500);
    }
  }, [currentView, scrollDates, scrollToIndex]);

  const handleViewChange = useCallback(
    (view: ViewType) => {
      setCurrentView(view);
      setCurrentDate(prev => {
        if (view === 'Month') return startOfWeek(prev);
        if (currentView === 'Month') return addDays(startOfWeek(prev), 3);
        return prev;
      });

      if (view === 'Month') {
        setActiveMonthDate(
          new Date(headerDate.getFullYear(), headerDate.getMonth(), 1),
        );
      }
    },
    [currentView, headerDate],
  );

  const handleSelectDate = useCallback(
    (d: Date) => {
      setSelectedDate(d);
      setCurrentDate(currentView === 'Month' ? startOfWeek(d) : d);
      setIsDayPanelOpen(true);
    },
    [currentView],
  );

  const renderView = useCallback(
    (date: Date) => {
      switch (currentView) {
        case 'Year':
          return <YearView date={date} />;
        case 'Month':
          return (
            <MonthView
              weekStart={date}
              focusDate={headerDate}
              monthBlend={monthBlend}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              eventsByDate={eventsByDateMerged}
            />
          );
        case 'Week':
          return (
            <WeekView
              date={date}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />
          );
        case 'Day':
          return <DayView date={date} />;
      }
    },
    [currentView, eventsByDate, handleSelectDate, headerDate, selectedDate],
  );

  useEffect(() => {
    if (currentView === 'Day') {
      setIsDayPanelOpen(false);
    }
  }, [currentView]);

  return (
    <Page className="h-full min-h-0">
      {/* Header with month/year and controls */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border/40 bg-background/90 px-4 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          {currentView === 'Month' ? (
            <div
              ref={monthTitleAnchorRef}
              className="relative grid h-9 w-max overflow-hidden"
                      style={{
                opacity: 1,
              }}
            >
              {(() => {
                const H = 36;
                const currentLabel = formatDateHeader(activeMonthDate, 'Month');
                // Hidden, non-transformed text used only for measurement (perfect alignment target).
                // It must match the header title typography.
                const measure = (
                  <span
                    ref={monthTitleStaticTextRef}
                    className="pointer-events-none absolute left-0 top-0 whitespace-nowrap text-2xl font-semibold leading-none opacity-0"
                  >
                    {currentLabel}
                  </span>
                );
                if (
                  !headerMonthSwap ||
                  headerMonthSwap.incomingKey === monthKey(activeMonthDate)
                ) {
                  return (
                    <div className="col-start-1 row-start-1 whitespace-nowrap text-2xl font-semibold leading-none">
                      {measure}
                      <span>{currentLabel}</span>
                    </div>
                  );
                }

                // Header push is intentionally short-range; progress already reflects the "close to title" window.
                const p = Math.max(0, Math.min(1, headerMonthSwap.progress));
                const incomingLabel = headerMonthSwap.incomingLabel;

                const currentY =
                  headerMonthSwap.direction === 'down' ? -p * H : p * H;
                const incomingY =
                  headerMonthSwap.direction === 'down'
                    ? (1 - p) * H
                    : -(1 - p) * H;
                const currentOpacity = 1 - p * 0.85;
                const incomingOpacity = 0.85 + p * 0.15;

                return (
                  <>
                    <div
                      className="col-start-1 row-start-1 whitespace-nowrap text-2xl font-semibold leading-none"
                      style={{
                        transform: `translateY(${currentY}px)`,
                        opacity: currentOpacity,
                        transition: 'transform 0ms, opacity 0ms',
                      }}
                    >
                      {measure}
                      <span>{currentLabel}</span>
                    </div>
                    {monthTitleTransition?.key === headerMonthSwap.incomingKey ? null : (
                    <div
                        className="col-start-1 row-start-1 whitespace-nowrap text-2xl font-semibold leading-none"
                      style={{
                          transform: `translateY(${incomingY}px)`,
                          opacity: incomingOpacity,
                          transition: 'transform 0ms, opacity 0ms',
                        }}
                      >
                        <span>{incomingLabel}</span>
                    </div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <h1 className="text-2xl font-semibold">
              {formatDateHeader(headerDate, currentView)}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          {eventsStatus === 'loading' ? (
            <span className="text-xs text-muted-foreground">Syncing…</span>
          ) : null}
          {eventsStatus === 'error' ? (
            <span className="text-xs text-destructive">Sync failed</span>
          ) : null}
          <label className="flex items-center gap-1 text-xs text-muted-foreground select-none">
            <input
              type="checkbox"
              className="h-3 w-3 accent-emerald-500"
              checked={useMockEvents}
              onChange={e => setUseMockEvents(e.target.checked)}
            />
            Mock
          </label>
          <div className="flex h-8 items-center bg-muted/50 rounded-md p-0.5">
            {viewOptions.map(view => {
              const isActive = view === currentView;
              return (
                <button
                  key={view}
                  onClick={() => handleViewChange(view)}
                  className="relative h-7 px-3 text-xs font-medium rounded transition-colors"
                >
                  {isActive ? (
                    <motion.span
                      layoutId="calendar-view-pill"
                      className="absolute inset-0 rounded bg-background shadow-sm"
                      transition={{
                        type: 'spring',
                        damping: 30,
                        stiffness: 380,
                      }}
                    />
                  ) : null}
                  <span
                    className={`relative ${
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {view}
                  </span>
                </button>
              );
            })}
          </div>
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/settings/integrations">Connect calendars</Link>
          </Button>
          <Button size="sm">New Event</Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {currentView === 'Month' && monthTitleTransition ? (
          <div
            className="pointer-events-none fixed left-0 top-0 z-60 whitespace-nowrap text-2xl font-semibold leading-none text-foreground"
            style={{
              transform: `translate(${monthTitleTransition.x}px, ${monthTitleTransition.y}px) scale(${monthTitleTransition.scale})`,
              transformOrigin: 'left top',
              // Must be scroll-coupled (no lag) for pixel-perfect alignment.
              transition: 'transform 0ms linear',
              opacity: 1,
            }}
          >
            {monthTitleTransition.label}
          </div>
        ) : null}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={viewContainerKey}
            className="h-full"
            initial={{ opacity: 0, scale: 0.995 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.995 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="relative h-full">
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="relative h-full overflow-y-auto overflow-x-hidden"
              >
                {isMonthView && monthDividerSegments.length ? (
                  <div
                    className="pointer-events-none absolute left-0 top-0 right-0 z-20"
                    style={{ height: monthDividerContentHeight }}
                  >
                    {monthDividerSegments.map(seg => (
                      <div
                        key={`month-divider-seg-${seg.key}`}
                        className="absolute left-0 right-0"
                        style={{ top: seg.top, height: seg.height }}
                      >
                        {seg.outline.map(item => {
                          if (item.orientation === 'h') {
                            return (
                              <div
                                key={item.id}
                                className={`absolute ${
                                  item.emphasis ? 'h-[2px]' : 'h-px'
                                } ${item.emphasis ? 'bg-white/25' : 'bg-white/10'}`}
                                style={{
                                  top: item.top,
                                  left: `${item.leftPct}%`,
                                  width: `${item.widthPct}%`,
                                }}
                              />
                            );
                          }

                          // Avoid drawing a month-boundary "frame" on the far-left edge.
                          if (item.leftPct < 0.01) return null;

                          return (
                            <div
                              key={item.id}
                              className={`absolute w-px ${
                                item.emphasis ? 'bg-white/22' : 'bg-white/8'
                              }`}
                              style={{
                                top: item.top,
                                height: item.height,
                                left: `${item.leftPct}%`,
                                transform:
                                  item.leftPct < 0.01
                                    ? 'translateX(0px)'
                                    : item.leftPct > 99.99
                                      ? 'translateX(-1px)'
                                      : 'translateX(-0.5px)',
                              }}
                            />
                          );
                        })}
                        {Array.from({ length: 6 }, (_, i) => {
                          const leftPct = `${((i + 1) * 100) / 7}%`;
                          return (
                            <div
                              key={`month-divider-${seg.key}-${i}`}
                                  className="absolute inset-y-0 w-px -translate-x-1/2 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.06)_4%,rgba(255,255,255,0.06)_96%,transparent)]"
                              style={{ left: leftPct }}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ) : null}
                {scrollDates.map((date, index) => (
                  <div
                    key={`${date.getTime()}-${index}`}
                    data-snap="1"
                    className={
                      isMonthView
                        ? 'relative shrink-0'
                        : 'h-full shrink-0 p-3 flex flex-col'
                    }
                  >
                    {isMonthView ? (
                      <>
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.12)_4%,rgba(255,255,255,0.12)_96%,transparent)]" />
                        <div className="relative">
                          {(() => {
                            const key = monthLabelKeyForWeek(date);
                            if (!key) return null;
                            const [y, m] = key.split('-').map(Number);
                            if (!Number.isFinite(y) || !Number.isFinite(m))
                              return null;
                            const label = formatDateHeader(
                              new Date(y, m, 1),
                              'Month',
                            );
                            const activeKey = monthKey(activeMonthDate);
                            const isIncomingSwapKey =
                              headerMonthSwap?.incomingKey === key &&
                              (headerMonthSwap?.progress ?? 0) > 0;
                            const isMonthLabelHidden =
                              key === activeKey ||
                              isIncomingSwapKey ||
                              monthTitleTransition?.key === key;
                            return (
                              <div
                                data-month-label-key={key}
                                className="pointer-events-none absolute left-0 top-1 z-20 flex h-9 items-center px-2 text-2xl font-medium leading-none text-muted-foreground/60"
                                style={{
                                  opacity:
                                    // Never show the in-grid month label for the active header month
                                    // (prevents duplicates on refresh/scroll). During transition, also hide.
                                    isMonthLabelHidden ? 0 : 1,
                                  width: `${(2 / 7) * 100}%`,
                                }}
                              >
                                <span data-month-label-text="1">{label}</span>
                              </div>
                            );
                          })()}
                          <MonthView
                            weekStart={date}
                            focusDate={headerDate}
                            monthBlend={monthBlend}
                            selectedDate={selectedDate}
                            onSelectDate={handleSelectDate}
                            eventsByDate={eventsByDateMerged}
                            // Hide the day number labels underneath the month label span (2 columns wide),
                            // but ONLY when that month label is actually visible.
                            hideDayNumberCols={
                              (() => {
                                const key = monthLabelKeyForWeek(date);
                                if (!key) return 0;
                                const activeKey = monthKey(activeMonthDate);
                                const isIncomingSwapKey =
                                  headerMonthSwap?.incomingKey === key &&
                                  (headerMonthSwap?.progress ?? 0) > 0;
                                const isMonthLabelHidden =
                                  key === activeKey ||
                                  isIncomingSwapKey ||
                                  monthTitleTransition?.key === key;
                                return isMonthLabelHidden ? 0 : 2;
                              })()
                            }
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 min-h-0 h-full">
                        {renderView(date)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <Modal open={isDayPanelOpen} onOpenChange={setIsDayPanelOpen}>
        <ModalContent
          variant="slide"
          slideWidth="lg"
          margin="none"
          // Equal window-edge inset on top/right/bottom (match the right side).
          // IMPORTANT: override the slide panel's default fixed height so `bottom` actually applies.
          className="!top-5 !right-5 !bottom-5 !h-auto !mb-0 !rounded-2xl"
        >
          <ModalHeader
            title={<ModalTitle>Agenda</ModalTitle>}
            description={
              selectedDate
                ? selectedDate.toLocaleDateString('default', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })
                : undefined
            }
            actions={
              <div className="flex items-center gap-2">
                <Button size="sm">New Event</Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  if (!selectedDate) return;
                  handleViewChange('Day');
                  setCurrentDate(selectedDate);
                  setIsDayPanelOpen(false);
                }}
              >
                Open Day View
              </Button>
              </div>
            }
          />
          <ModalBody className="!px-0 !py-0">
            {selectedDate ? (
              <DayAgendaPanel
                date={selectedDate}
                events={eventsByDateMerged.get(dateKey(selectedDate)) ?? []}
              />
            ) : null}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Page>
  );
}
