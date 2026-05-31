'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Separator, Badge } from '@summoniq/applab-ui';
import { Send, Sparkles, Check, X, RotateCcw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Revision {
  id: string;
  code: string;
  description: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected';
  prompt: string;
}

interface ComponentChatProps {
  componentId: string;
  componentCode: string;
  componentType: 'component' | 'background';
  onRevisionAccepted?: (revision: Revision) => void;
}

export function ComponentChat({
  componentId,
  componentCode,
  componentType,
  onRevisionAccepted,
}: ComponentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [currentRevisionId, setCurrentRevisionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/components/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentId,
          componentCode,
          componentType,
          prompt: input,
          previousRevisions: revisions.map((r) => ({
            id: r.id,
            description: r.description,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to generate revision');

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.explanation,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Add new revision
      const newRevision: Revision = {
        id: Date.now().toString(),
        code: data.code,
        description: data.description,
        timestamp: new Date(),
        status: 'pending',
        prompt: input,
      };

      setRevisions((prev) => [...prev, newRevision]);
    } catch (error) {
      console.error('Error generating revision:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error generating the revision. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRevision = async (revisionId: string) => {
    try {
      // Update in database
      await fetch(`/api/components/${componentId}/revisions/${revisionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED', isCurrent: true }),
      });

      setRevisions((prev) =>
        prev.map((r) =>
          r.id === revisionId
            ? { ...r, status: 'accepted' as const }
            : r.status === 'accepted'
              ? { ...r, status: 'rejected' as const }
              : r,
        ),
      );
      setCurrentRevisionId(revisionId);
      const revision = revisions.find((r) => r.id === revisionId);
      if (revision && onRevisionAccepted) {
        onRevisionAccepted({ ...revision, status: 'accepted' });
      }
    } catch (error) {
      console.error('Error accepting revision:', error);
    }
  };

  const handleRejectRevision = async (revisionId: string) => {
    try {
      // Update in database
      await fetch(`/api/components/${componentId}/revisions/${revisionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', isCurrent: false }),
      });

      setRevisions((prev) =>
        prev.map((r) => (r.id === revisionId ? { ...r, status: 'rejected' as const } : r)),
      );
    } catch (error) {
      console.error('Error rejecting revision:', error);
    }
  };

  const handleRevertToRevision = async (revisionId: string) => {
    try {
      // Update in database
      await fetch(`/api/components/${componentId}/revisions/${revisionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED', isCurrent: true }),
      });

      setRevisions((prev) =>
        prev.map((r) =>
          r.id === revisionId
            ? { ...r, status: 'accepted' as const }
            : { ...r, status: r.status === 'accepted' ? 'rejected' as const : r.status },
        ),
      );
      setCurrentRevisionId(revisionId);
      const revision = revisions.find((r) => r.id === revisionId);
      if (revision && onRevisionAccepted) {
        onRevisionAccepted({ ...revision, status: 'accepted' });
      }
    } catch (error) {
      console.error('Error reverting revision:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat Interface */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>AI Component Assistant</CardTitle>
          </div>
          <CardDescription>
            Describe how you'd like to modify this {componentType}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <div className="h-[400px] overflow-y-auto space-y-4 p-4 rounded-lg border bg-muted/30">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div className="space-y-2">
                  <Sparkles className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Ask me to modify the {componentType}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    For example: "Make the button larger" or "Add a gradient background"
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-lg px-4 py-2',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted',
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Describe your changes..."
              className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="sm"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Revision History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <CardTitle className="text-lg">Revisions</CardTitle>
          </div>
          <CardDescription>
            {revisions.length} revision{revisions.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {revisions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No revisions yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {[...revisions].reverse().map((revision, index) => (
                <div
                  key={revision.id}
                  className={cn(
                    'p-3 rounded-lg border transition-all',
                    revision.status === 'accepted'
                      ? 'bg-primary/10 border-primary'
                      : revision.status === 'rejected'
                        ? 'bg-muted/50 border-muted opacity-60'
                        : 'bg-background border-border',
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          Revision #{revisions.length - index}
                        </span>
                        {revision.status === 'accepted' && (
                          <Badge variant="default" className="text-xs px-1.5 py-0">
                            Current
                          </Badge>
                        )}
                        {revision.status === 'rejected' && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            Rejected
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {revision.prompt}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs mb-3">{revision.description}</p>

                  {revision.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 h-7 text-xs"
                        onClick={() => handleAcceptRevision(revision.id)}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs"
                        onClick={() => handleRejectRevision(revision.id)}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {revision.status === 'accepted' &&
                    revision.id !== currentRevisionId && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-7 text-xs"
                        onClick={() => handleRevertToRevision(revision.id)}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Revert to this
                      </Button>
                    )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

