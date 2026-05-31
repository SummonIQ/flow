'use client';

import {
  Page,
} from '@/components/ui/page-layout';

import {
  Badge,
  Button,
} from '@summoniq/applab-ui';
import {
  Archive,
  Clock,
  Inbox,
  Mail,
  MailOpen,
  Pencil,
  Search,
  Send,
  Star,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

type Message = {
  id: string;
  subject: string;
  sender: string;
  senderEmail: string;
  preview: string;
  body: string;
  time: string;
  tags: string[];
  unread: boolean;
  attachments?: { name: string; size: string }[];
};

const mailboxes = [
  { name: 'Inbox', icon: Inbox, count: 12 },
  { name: 'Sent', icon: Send, count: 4 },
  { name: 'Starred', icon: Star, count: 3 },
  { name: 'Archive', icon: MailOpen, count: 18 },
  { name: 'Trash', icon: Trash2, count: 2 },
];

const messages: Message[] = [
  {
    id: 'msg-001',
    subject: 'Design handoff: Flow onboarding refresh',
    sender: 'Luna Martinez',
    senderEmail: 'luna@flow.local',
    preview:
      'Shared the Figma file and checklist for the new onboarding flow. Let me know if you need variants.',
    body: `Hi team — sharing the latest assets and checklist for the Flow onboarding refresh. Please review the following items before Friday so we can finalize the rollout.

• Confirm the primary CTA copy and tone.
• Verify the new walkthrough steps with engineering.
• Update the analytics events for the new completion flow.
• Sign off on the polished illustration set.

Let me know if you need any variants or have questions!

Best,
Luna`,
    time: '9:42 AM',
    tags: ['Design', 'Priority'],
    unread: true,
    attachments: [
      { name: 'Flow_Onboarding_Checklist.pdf', size: '2.1 MB' },
      { name: 'Onboarding_UI_Updates.fig', size: '7.8 MB' },
      { name: 'Illustrations.zip', size: '2.5 MB' },
    ],
  },
  {
    id: 'msg-002',
    subject: 'Q4 rollout: analytics integration checklist',
    sender: 'Alex Chen',
    senderEmail: 'alex@flow.local',
    preview:
      'We have the instrumentation list ready. Pending: events for templates and workflows.',
    body: `Hey team,

We have the instrumentation list ready for Q4. Here's what's pending:

1. Events for templates section
2. Workflow completion tracking
3. User engagement metrics

Can we sync tomorrow to finalize?

Alex`,
    time: '8:17 AM',
    tags: ['Engineering'],
    unread: true,
  },
  {
    id: 'msg-003',
    subject: 'Weekly status - Flow desktop release',
    sender: 'Morgan Patel',
    senderEmail: 'morgan@flow.local',
    preview:
      'Builds look stable. I pushed the performance patch and tagged the next canary.',
    body: `Weekly update:

Builds are looking stable. I pushed the performance patch yesterday and tagged the next canary release.

Key changes:
- Memory optimization for large projects
- Fixed sidebar rendering issue
- Improved startup time by 15%

Let me know if you see any issues.

Morgan`,
    time: 'Yesterday',
    tags: ['Release'],
    unread: false,
  },
  {
    id: 'msg-004',
    subject: 'New client handoff: Harper & Co.',
    sender: 'Casey Rivera',
    senderEmail: 'casey@flow.local',
    preview:
      'Attached the discovery notes and timeline. Needs review before kickoff on Tuesday.',
    body: `Hi all,

Attached are the discovery notes and proposed timeline for Harper & Co. Please review before the kickoff meeting on Tuesday.

Key points:
- 6-month engagement
- Focus on brand refresh and website redesign
- Budget approved for Phase 1

Casey`,
    time: 'Mon',
    tags: ['Client'],
    unread: false,
  },
  {
    id: 'msg-005',
    subject: 'Reminder: Security review follow-up',
    sender: 'Jordan Lee',
    senderEmail: 'jordan@flow.local',
    preview:
      'Please confirm the remediation steps for webhook signing and token rotation.',
    body: `Team,

Quick reminder to confirm the remediation steps for:
1. Webhook signing implementation
2. Token rotation schedule

We need to close these items by end of week.

Thanks,
Jordan`,
    time: 'Mon',
    tags: ['Security'],
    unread: false,
  },
];

function MessageDetail({
  message,
  onClose,
}: {
  message: Message;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-border/40 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="pointer-events-none rounded-lg bg-indigo-500/10 p-1.5 text-indigo-500">
              <Mail className="h-4 w-4" />
            </div>
            <h2 className="truncate text-sm font-medium">{message.subject}</h2>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{message.sender}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{message.senderEmail}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {message.time}
            </span>
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="whitespace-pre-wrap text-sm">{message.body}</div>

        {message.attachments && message.attachments.length > 0 ? (
          <div className="mt-4 rounded-md border border-border/40 bg-muted/20 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium">Attachments</p>
                <p className="text-[10px] text-muted-foreground">
                  {message.attachments.length} files
                </p>
              </div>
              <Button size="sm" variant="ghost" className="h-7 text-xs">
                Download all
              </Button>
            </div>
            <div className="space-y-1">
              {message.attachments.map(file => (
                <div
                  key={file.name}
                  className="flex items-center justify-between rounded border border-border/30 bg-background px-2 py-1.5 text-[10px]"
                >
                  <span className="truncate">{file.name}</span>
                  <span className="ml-2 shrink-0 text-muted-foreground">
                    {file.size}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex gap-2 pt-4">
          <Button size="sm">Reply</Button>
          <Button size="sm" variant="secondary">
            Forward
          </Button>
          <Button size="sm" variant="ghost">
            Mark as done
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function EmailPage() {
  const [selectedMailbox, setSelectedMailbox] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  return (
    <Page className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40">
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-indigo-500" />
          <h1 className="text-lg font-semibold">Email</h1>
          <Badge variant="secondary" className="text-xs">
            {messages.filter(m => m.unread).length} unread
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search messages..."
              className="h-8 w-48 rounded-md border border-border bg-background pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <Button variant="secondary" size="sm">
            <Archive className="h-3.5 w-3.5 mr-1.5" />
            Archive
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/settings/integrations">Connect email</Link>
          </Button>
          <Button size="sm">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Compose
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Mailboxes Sidebar - Fixed width */}
        <div className="w-48 shrink-0 border-r border-border/40 p-2 overflow-auto">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide px-2 mb-2">
            Mailboxes
          </p>
          <div className="space-y-0.5">
            {mailboxes.map((box, idx) => (
              <button
                key={box.name}
                onClick={() => setSelectedMailbox(idx)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition ${
                  idx === selectedMailbox
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                type="button"
              >
                <span className="flex items-center gap-2">
                  <box.icon className="h-3.5 w-3.5" />
                  {box.name}
                </span>
                <span className="text-[10px]">{box.count}</span>
              </button>
            ))}
          </div>
        </div>

        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1"
          autoSaveId="email-layout"
        >
          {/* Message List */}
          <ResizablePanel defaultSize={35} minSize={25} collapsible={false}>
            <div className="h-full border-r border-border/40 overflow-auto">
              <div className="p-2 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {mailboxes[selectedMailbox].name}
                  </p>
                  <Badge variant="outline" className="text-[10px]">
                    {messages.length}
                  </Badge>
                </div>
              </div>
              <div className="divide-y divide-border/30">
                {messages.map(message => (
                  <button
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`w-full p-2.5 text-left transition hover:bg-muted/40 ${
                      selectedMessage?.id === message.id ? 'bg-primary/5' : ''
                    }`}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-medium truncate ${
                              message.unread
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {message.sender}
                          </span>
                          {message.unread && (
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-foreground truncate mt-0.5">
                          {message.subject}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {message.time}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1">
                      {message.preview}
                    </p>
                    <div className="flex gap-1 mt-1.5">
                      {message.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[9px] px-1 py-0 h-4"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main area - shows prompt when no message selected */}
          <ResizablePanel defaultSize={65} minSize={40} collapsible={false}>
            <div className="h-full">
              {!selectedMessage ? (
                <div className="text-center">
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MailOpen className="mx-auto mb-3 h-12 w-12 opacity-40" />
                  <p className="text-sm">Select a message to read</p>
                    </div>
                  </div>
                </div>
              ) : (
                <MessageDetail
                  message={selectedMessage}
                  onClose={() => setSelectedMessage(null)}
                />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </Page>
  );
}
