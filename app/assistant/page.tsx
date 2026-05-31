'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import {
  getPusherClient } from '@/lib/pusher/client';
import { Button,
  Card,
} from '@summoniq/applab-ui';
import { Bot, ChevronDown, Send, Sparkles, Terminal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

type AssistantAction =
  | {
      type: 'navigate';
      label: string;
      href: string;
    }
  | {
      type: 'launch_app';
      label: string;
      projectName: string;
      appName: string;
    };

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: AssistantAction[];
};

export default function AssistantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your SummonIQ AI assistant with direct access to your orchestrator via MCP tools. I can help you:\n\n- List and view your projects\n- Manage teams and their members\n- Access workflow information\n- Query agent capabilities\n- View and track tickets\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeProjectName, setActiveProjectName] = useState<string | null>(
    null,
  );

  const progressThrottleRef = useRef<Map<string, number>>(new Map());

  const handleAction = useCallback(
    async (action: AssistantAction) => {
      if (action.type === 'navigate') {
        router.push(action.href);
        return;
      }

      if (action.type === 'launch_app') {
        if (!window.electron) {
          toast.error('Launch is only available in the Electron app');
          return;
        }

        try {
          const projects = await window.electron.projects.getAll();
          const project = (projects as any[]).find(
            p => p?.name === action.projectName,
          );

          if (!project?.path) {
            toast.error(`Project not found: ${action.projectName}`);
            return;
          }

          const app = (project.apps as any[] | undefined)?.find(
            a => a?.name === action.appName,
          );

          if (!app) {
            toast.error(
              `App not found: ${action.appName} in ${action.projectName}`,
            );
            return;
          }

          toast.loading(`Starting ${action.appName}...`, {
            id: `assistant-launch-${action.projectName}-${action.appName}`,
          });

          const devPort =
            typeof app?.dev?.port === 'number'
              ? app.dev.port
              : typeof app?.devPort === 'number'
                ? app.devPort
                : null;

          const result = await window.electron.applications.launch(
            project.path,
            app.name,
            'dev',
            app.path || null,
            devPort,
          );

          if (result.success) {
            const url = devPort ? `http://localhost:${devPort}` : null;

            toast.success(result.message || `${action.appName} started`, {
              id: `assistant-launch-${action.projectName}-${action.appName}`,
              description: url
                ? url
                : result.pid
                  ? `Process ID: ${result.pid}`
                  : undefined,
            });

            appendSystemAssistantMessage(
              url
                ? `Started ${action.appName}. URL: ${url}`
                : `Started ${action.appName}.`,
            );

            router.push(
              `/projects/${encodeURIComponent(action.projectName)}/apps/${encodeURIComponent(action.appName)}`,
            );
            return;
          }

          toast.error(result.error || `Failed to launch ${action.appName}`, {
            id: `assistant-launch-${action.projectName}-${action.appName}`,
          });
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'Failed to launch app',
          );
        }
      }
    },
    [router],
  );

  const actionHandlers = useMemo(() => {
    return {
      handleAction,
    };
  }, [handleAction]);

  const appendSystemAssistantMessage = useCallback((content: string) => {
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Detect latest project from assistant actions and subscribe to realtime agent updates
  useEffect(() => {
    const latestProjectFromActions = (() => {
      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        if (msg.role !== 'assistant' || !msg.actions?.length) continue;

        for (const action of msg.actions) {
          if (action.type !== 'navigate') continue;

          const match = action.href.match(/^\/projects\/([^/?#]+)/);
          if (match?.[1]) {
            try {
              return decodeURIComponent(match[1]);
            } catch {
              return match[1];
            }
          }
        }
      }
      return null;
    })();

    if (
      latestProjectFromActions &&
      latestProjectFromActions !== activeProjectName
    ) {
      setActiveProjectName(latestProjectFromActions);
    }
  }, [messages, activeProjectName]);

  useEffect(() => {
    if (!activeProjectName) return;

    const pusher = getPusherClient();
    const channelName = `project-${activeProjectName}`;
    const channel = pusher.subscribe(channelName);

    appendSystemAssistantMessage(
      `Watching agent activity for project: ${activeProjectName}`,
    );

    channel.bind('agent-work-started', (data: any) => {
      const agentName = data?.agent?.name || 'Agent';
      const ticketTitle = data?.ticket?.title || 'a ticket';
      appendSystemAssistantMessage(
        `${agentName} started working on "${ticketTitle}"`,
      );
    });

    channel.bind('agent-progress', (data: any) => {
      const ticketId = String(data?.ticketId || 'unknown');
      const now = Date.now();
      const last = progressThrottleRef.current.get(ticketId) || 0;

      // Throttle noisy progress updates per ticket
      if (now - last < 2000 && data?.progress !== 100) {
        return;
      }
      progressThrottleRef.current.set(ticketId, now);

      const agentName = data?.agentName || 'Agent';
      const message = data?.message || data?.step || 'Progress update';
      const progress =
        typeof data?.progress === 'number' ? data.progress : null;

      appendSystemAssistantMessage(
        progress !== null
          ? `${agentName}: ${message} (${progress}%)`
          : `${agentName}: ${message}`,
      );
    });

    channel.bind('agent-work-completed', (data: any) => {
      const agentName = data?.agentName || 'Agent';
      const ticketTitle = data?.ticketTitle || 'a ticket';
      appendSystemAssistantMessage(
        `${agentName} completed work on "${ticketTitle}"`,
      );
    });

    channel.bind('agent-work-stopped', (data: any) => {
      const agentName = data?.agentName || 'Agent';
      const ticketTitle = data?.ticketTitle || 'a ticket';
      appendSystemAssistantMessage(
        `${agentName} stopped work on "${ticketTitle}"`,
      );
    });

    channel.bind('ticket-created', (data: any) => {
      const title = data?.ticket?.title;
      if (title) {
        appendSystemAssistantMessage(`New ticket created: "${title}"`);
      }
    });

    channel.bind('ticket-updated', (data: any) => {
      const title = data?.ticket?.title;
      const status = data?.ticket?.status;
      if (title && status) {
        appendSystemAssistantMessage(`Ticket updated: "${title}" → ${status}`);
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [activeProjectName, appendSystemAssistantMessage]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setShowNewMessage(false);
    setIsUserScrolledUp(false);
  }, []);

  // Auto-scroll when new messages arrive (if user hasn't scrolled up)
  useEffect(() => {
    if (!isUserScrolledUp) {
      scrollToBottom('smooth');
    } else if (messages.length > 0) {
      // User is scrolled up and there are new messages
      setShowNewMessage(true);
    }
  }, [messages, isUserScrolledUp, scrollToBottom]);

  // Handle scroll events to detect if user scrolled up
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (isAtBottom) {
      setIsUserScrolledUp(false);
      setShowNewMessage(false);
    } else {
      setIsUserScrolledUp(true);
    }
  }, []);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 55000); // 55 second timeout

      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        actions: Array.isArray(data.actions) ? data.actions : undefined,
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error:', error);

      let errorContent = 'Failed to get response';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorContent =
            'Request timeout - The AI assistant took too long to respond. Try simplifying your request or try again.';
        } else {
          errorContent = error.message;
        }
      }

      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${errorContent}\n\nMake sure you have set your OPENAI_API_KEY in the .env file.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <Page className="h-full max-h-full !min-h-0 !overflow-hidden flex flex-col">
      <PageHeader
        className="flex-shrink-0"
        title={
          <span className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Assistant
          </span>
        }
        description="ChatGPT integration with Flow MCP Server"
        actions={
          <div className="flex gap-2">
            <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 text-xs font-medium">
              ● Live
            </div>
            <a
              href="/docs"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <Terminal className="w-4 h-4" />
              Setup Guide
            </a>
          </div>
        }
      />

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-scroll overflow-x-hidden p-4 space-y-4 relative"
      >
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <Card
              className={`max-w-[80%] p-4 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50'
              }`}
            >
              <div className="text-sm markdown-content">
                <ReactMarkdown
                  components={{
                    ul: ({ children }) => (
                      <ul className="my-2 space-y-1 ml-4">{children}</ul>
                    ),
                    li: ({ children }) => (
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>{children}</span>
                      </li>
                    ),
                    p: ({ children }) => <p className="my-1">{children}</p>,
                    h3: ({ children }) => (
                      <h3 className="font-semibold mt-3 mb-1">{children}</h3>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold">{children}</strong>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              {message.role === 'assistant' && message.actions?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.actions.map((action, actionIdx) => (
                    <Button
                      key={`${action.type}-${actionIdx}`}
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => actionHandlers.handleAction(action)}
                      disabled={loading}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              ) : null}
              <p className="text-xs mt-2 opacity-70" suppressHydrationWarning>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </Card>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-primary-foreground font-semibold">
                  You
                </span>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <Card className="bg-muted/50 p-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-200" />
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* New Message Button */}
      {showNewMessage && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Button
            onClick={() => scrollToBottom('smooth')}
            size="sm"
            className="shadow-lg gap-2 rounded-full px-4"
          >
            New Message
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border bg-background p-4">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask me anything about your projects, teams, or workflows..."
            className="flex-1 px-4 py-3 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()} size="lg">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Page>
  );
}
