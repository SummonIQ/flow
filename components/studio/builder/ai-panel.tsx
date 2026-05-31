'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/studio/ui/select';
import { useBuilderStore } from '@/lib/studio/store';
import { cn, generateId } from '@/lib/utils';
import { BuilderComponent } from '@/types/studio/builder';
import { motion, useDragControls } from 'framer-motion';
import {
  Ban,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const AI_MODEL_STORAGE_KEY = 'ai-panel:model';
const AI_CHAT_STORAGE_KEY_PREFIX = 'ai-panel:chat';
const AI_MODEL_OPTIONS = [
  { value: 'gpt-5', label: 'GPT-5' },
  { value: 'o1-pro', label: 'o1-pro' },
  { value: 'o3', label: 'o3' },
  { value: 'o4-mini', label: 'o4-mini' },
  { value: 'gpt-4.1', label: 'GPT-4.1' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o mini' },
  { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
  { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
];

function safeStorageKeyPart(value: string): string {
  return encodeURIComponent(value);
}

function getChatStorageKey(args: {
  projectName: string | undefined;
  appName: string | undefined;
  pageId: string | null | undefined;
}): string {
  return [
    AI_CHAT_STORAGE_KEY_PREFIX,
    safeStorageKeyPart(args.projectName ?? 'unknown'),
    safeStorageKeyPart(args.appName ?? 'unknown'),
    safeStorageKeyPart(args.pageId ?? 'unknown'),
  ].join(':');
}

function parseStoredMessages(raw: string | null): Message[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (m): m is Message =>
          !!m &&
          typeof m === 'object' &&
          'id' in m &&
          'role' in m &&
          'content' in m &&
          'timestamp' in m &&
          typeof (m as any).id === 'string' &&
          ((m as any).role === 'user' || (m as any).role === 'assistant') &&
          typeof (m as any).content === 'string' &&
          typeof (m as any).timestamp === 'number',
      )
      .map(m => m);
  } catch {
    return [];
  }
}

// Content-only component for docked mode
export function AIPanelContent() {
  const [activeTab, setActiveTab] = useState<'generate' | 'chat'>('generate');
  const [model, setModel] = useState<string>('gpt-4o');

  // Generate state
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [replaceMode, setReplaceMode] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    aiComponents,
    removeAiComponent,
    loadAiComponents,
    getRootId,
    getComponents,
    updateComponent,
    addAiComponent,
    insertComponentWithData,
    selectedId,
    setIsDragging,
    setDraggedAiComponentData,
    studioContext,
    project,
  } = useBuilderStore();

  const chatStorageKey = useMemo(() => {
    return getChatStorageKey({
      projectName: studioContext?.projectName ?? project?.name,
      appName: studioContext?.appName,
      pageId: project?.currentPageId,
    });
  }, [
    studioContext?.projectName,
    studioContext?.appName,
    project?.name,
    project?.currentPageId,
  ]);

  // Load AI components on mount
  useEffect(() => {
    loadAiComponents();
  }, [loadAiComponents]);

  useEffect(() => {
    const saved = localStorage.getItem(AI_MODEL_STORAGE_KEY);
    if (saved) setModel(saved);
  }, []);

  useEffect(() => {
    setMessages(parseStoredMessages(localStorage.getItem(chatStorageKey)));
  }, [chatStorageKey]);

  useEffect(() => {
    localStorage.setItem(chatStorageKey, JSON.stringify(messages));
  }, [chatStorageKey, messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate progress while generating
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 30) return prev + 10;
          if (prev < 60) return prev + 5;
          if (prev < 80) return prev + 2;
          if (prev < 95) return prev + 0.5;
          return prev;
        });
      }, 500);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleDragStart = (e: React.DragEvent, component: any) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('componentType', component.type);
    e.dataTransfer.setData('aiComponentData', JSON.stringify(component));
    // Also store in zustand for Electron fallback (native drop events can fail)
    setIsDragging(true);
    setDraggedAiComponentData(component);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedAiComponentData(null);
  };

  const handleGenerate = async () => {
    if (!generatePrompt.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: generatePrompt, model }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate');
      }

      const { component } = await response.json();

      const makeRootNameFromPrompt = (description: string): string => {
        const cleaned = description
          .replace(/[^a-zA-Z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 4);
        if (cleaned.length === 0) return 'GeneratedLayout';
        return cleaned
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
      };

      const genericRootNames = new Set([
        'MainContainer',
        'Root',
        'Wrapper',
        'Container',
        'Layout',
      ]);

      const rootId = getRootId();

      const convertComponent = (
        originalComp: any,
        parentId: string | null,
      ): any => {
        const id = generateId();
        let comp = { ...originalComp };
        const childComponents: any[] = [];

        if (comp.children && Array.isArray(comp.children)) {
          comp.children.forEach((child: any) => {
            const converted = convertComponent(child, id);
            childComponents.push(converted);
          });
        }

        const isFirstLevelUnderPageRoot = parentId === rootId;

        if (
          comp.type === 'Text' &&
          comp.props &&
          typeof comp.props.text === 'string'
        ) {
          const rawText = comp.props.text as string;
          const text = rawText.toLowerCase().trim();
          const looksLikePlaceholder =
            text.startsWith('enter ') ||
            text.startsWith('type ') ||
            text.startsWith('your ');
          const mentionsField =
            text.includes('email') ||
            text.includes('password') ||
            text.includes('username') ||
            text.includes('name');

          if (looksLikePlaceholder && mentionsField) {
            const isPassword = text.includes('password');
            comp = {
              ...comp,
              type: 'Input',
              props: {
                placeholder: rawText,
                type: isPassword ? 'password' : 'text',
              },
            };
          }
        }

        let name: string = comp.name || comp.type;

        if (isFirstLevelUnderPageRoot) {
          const normalized = name.replace(/\d+$/g, '');
          if (genericRootNames.has(normalized)) {
            name = makeRootNameFromPrompt(generatePrompt);
          }
        }

        const props = comp.props || {};
        const styles = comp.styles || {};
        let className = comp.className || '';

        // Apply TailwindCSS v4 class defaults for common components
        if (comp.type === 'Input' && !className) {
          className =
            'w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground';
        } else if (comp.type === 'Button' && !className) {
          const text = (props.text || '').toString().toLowerCase();
          if (text.includes('google')) {
            className =
              'px-4 py-2 rounded-md text-sm font-medium bg-white text-blue-600 border border-border';
          } else if (text.includes('facebook')) {
            className =
              'px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white';
          } else {
            className =
              'px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground';
          }
        }

        return {
          id,
          type: comp.type,
          name,
          parentId,
          props,
          styles,
          className,
          children: childComponents,
          events: comp.events || {},
        };
      };

      if (!rootId) {
        toast.error('No page found. Please create a page first.');
        return;
      }

      const components = getComponents();
      const pageComponent = components[rootId];

      if (replaceMode && pageComponent) {
        const backup = {
          timestamp: Date.now(),
          components: pageComponent.children,
        };
        localStorage.setItem('ai-generator-backup', JSON.stringify(backup));
        updateComponent(rootId, { children: [] });
        toast.info('Previous components backed up');
      }

      const newComponent = convertComponent(component, rootId);

      function countComponents(comp: any): number {
        return (
          1 +
          comp.children.reduce(
            (sum: number, child: any) => sum + countComponents(child),
            0,
          )
        );
      }

      const componentCount = countComponents(newComponent);

      insertComponentWithData(newComponent, rootId, 'inside');
      addAiComponent(newComponent);

      toast.success(`Generated ${componentCount} components successfully!`);
      setGeneratePrompt('');
    } catch (error: any) {
      console.error('Generate error:', error);
      toast.error(error.message || 'Failed to generate component');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: chatInput,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatting(true);

    try {
      const rootId = getRootId();
      const components = getComponents();
      const selectedComponent = selectedId ? components[selectedId] : null;

      const response = await fetch('/api/studio/chat-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          model,
          context: {
            selectedComponent: selectedComponent
              ? {
                  type: selectedComponent.type,
                  name: selectedComponent.name,
                  styles: selectedComponent.styles,
                  props: selectedComponent.props,
                }
              : null,
            componentCount: Object.keys(components).length,
          },
          history: messages.slice(-10),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (data.styleChanges && selectedId) {
        // chat-design is instructed to return Tailwind className changes
        if (typeof data.styleChanges === 'string') {
          updateComponent(selectedId, { className: data.styleChanges });
          toast.success('Applied Tailwind classes');
        } else if (
          typeof data.styleChanges === 'object' &&
          data.styleChanges !== null &&
          'className' in data.styleChanges &&
          typeof (data.styleChanges as any).className === 'string'
        ) {
          updateComponent(selectedId, {
            className: (data.styleChanges as any).className,
          });
          toast.success('Applied Tailwind classes');
        } else {
          // Back-compat: if the server returns inline styles
          updateComponent(selectedId, { styles: data.styleChanges });
          toast.success('Applied style changes');
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="flex flex-col h-full select-none">
      {/* Tabs */}
      <div className="flex justify-center border-b border-border bg-background/50 shrink-0">
        <button
          onClick={() => setActiveTab('generate')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors',
            activeTab === 'generate'
              ? 'text-foreground border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground',
          )}
        >
          <Wand2 size={14} />
          Generate
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors',
            activeTab === 'chat'
              ? 'text-foreground border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground',
          )}
        >
          <MessageSquare size={14} />
          Chat
        </button>
      </div>

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="p-3 border-b border-border bg-card shrink-0">
            <textarea
              value={generatePrompt}
              onChange={e => setGeneratePrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleGenerate();
                }
              }}
              placeholder="Describe what you want to build..."
              className="w-full h-20 px-3 py-2 text-sm bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none select-text"
              disabled={isGenerating}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={replaceMode}
                    onChange={e => setReplaceMode(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-border"
                  />
                  <span className="text-muted-foreground">
                    Replace existing
                  </span>
                </label>

                <Select
                  value={model}
                  onValueChange={next => {
                    setModel(next);
                    localStorage.setItem(AI_MODEL_STORAGE_KEY, next);
                  }}
                  disabled={isGenerating || isChatting}
                >
                  <SelectTrigger className="h-7 px-2 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_MODEL_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !generatePrompt.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={12} />
                    Generate
                  </>
                )}
              </button>
            </div>
            {isGenerating && (
              <div className="mt-2">
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-card">
            {aiComponents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Sparkles className="w-6 h-6 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">
                  No components yet
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Generate your first component above
                </p>
              </div>
            ) : (
              aiComponents.map(comp => (
                <div
                  key={comp.id}
                  draggable
                  onDragStart={e => handleDragStart(e, comp)}
                  onDragEnd={handleDragEnd}
                  className="group relative flex items-center gap-2 p-2 rounded-md border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing"
                >
                  <GripVertical size={12} className="text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">
                      {comp.name || comp.type}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {comp.type} • {comp.children.length} children
                    </div>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      removeAiComponent(comp.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all"
                  >
                    <Ban size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-card">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground font-medium">
                  Chat about your design
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1 px-4">
                  Ask questions, request changes, or get suggestions
                </p>
                <div className="mt-3 space-y-1.5">
                  {[
                    'Make this button more prominent',
                    'Center the content vertically',
                    'Add more spacing between sections',
                  ].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setChatInput(suggestion)}
                      className="block w-full text-[10px] text-left px-2 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex',
                      msg.role === 'user' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-lg px-3 py-2 text-xs select-text',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground',
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatting && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <Loader2
                        size={14}
                        className="animate-spin text-muted-foreground"
                      />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {messages.length > 0 && (
            <div className="px-3 py-1 border-t border-border bg-muted/30 shrink-0">
              <button
                onClick={() => {
                  setMessages([]);
                  localStorage.removeItem(chatStorageKey);
                }}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Trash2 size={10} />
                Clear chat
              </button>
            </div>
          )}

          <div className="p-2 border-t border-border bg-card shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleChat();
                  }
                }}
                placeholder="Ask about your design..."
                className="flex-1 px-3 py-1.5 text-xs bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary select-text"
                disabled={isChatting}
              />
              <button
                onClick={handleChat}
                disabled={isChatting || !chatInput.trim()}
                className="p-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Floating panel wrapper (legacy)
export function AIPanel() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'chat'>('generate');
  const [model, setModel] = useState<string>('gpt-4o');
  const dragControls = useDragControls();

  // Generate state
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [replaceMode, setReplaceMode] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [panelPosition, setPanelPosition] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth - 340 : 900,
    y: 120,
  });

  const {
    aiComponents,
    removeAiComponent,
    loadAiComponents,
    getRootId,
    getComponents,
    updateComponent,
    addAiComponent,
    insertComponentWithData,
    selectedId,
    setIsDragging,
    setDraggedAiComponentData,
    studioContext,
    project,
  } = useBuilderStore();

  const chatStorageKey = useMemo(() => {
    return getChatStorageKey({
      projectName: studioContext?.projectName ?? project?.name,
      appName: studioContext?.appName,
      pageId: project?.currentPageId,
    });
  }, [
    studioContext?.projectName,
    studioContext?.appName,
    project?.name,
    project?.currentPageId,
  ]);

  // Load AI components on mount
  useEffect(() => {
    loadAiComponents();
  }, [loadAiComponents]);

  useEffect(() => {
    const saved = localStorage.getItem(AI_MODEL_STORAGE_KEY);
    if (saved) setModel(saved);
  }, []);

  useEffect(() => {
    setMessages(parseStoredMessages(localStorage.getItem(chatStorageKey)));
  }, [chatStorageKey]);

  useEffect(() => {
    localStorage.setItem(chatStorageKey, JSON.stringify(messages));
  }, [chatStorageKey, messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate progress while generating
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 30) return prev + 10;
          if (prev < 60) return prev + 5;
          if (prev < 80) return prev + 2;
          if (prev < 95) return prev + 0.5;
          return prev;
        });
      }, 500);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleDragStart = (e: React.DragEvent, component: any) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('componentType', component.type);
    e.dataTransfer.setData('aiComponentData', JSON.stringify(component));
    // Also store in zustand for Electron fallback (native drop events can fail)
    setIsDragging(true);
    setDraggedAiComponentData(component);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedAiComponentData(null);
  };

  const handleGenerate = async () => {
    if (!generatePrompt.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: generatePrompt, model }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate');
      }

      const { component } = await response.json();

      const makeRootNameFromPrompt = (description: string): string => {
        const cleaned = description
          .replace(/[^a-zA-Z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 4);
        if (cleaned.length === 0) return 'GeneratedLayout';
        return cleaned
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
      };

      const genericRootNames = new Set([
        'MainContainer',
        'Root',
        'Wrapper',
        'Container',
        'Layout',
      ]);

      const rootId = getRootId();

      const convertComponent = (
        originalComp: any,
        parentId: string | null,
      ): BuilderComponent => {
        const id = generateId();
        let comp = { ...originalComp };
        const childComponents: BuilderComponent[] = [];

        if (comp.children && Array.isArray(comp.children)) {
          comp.children.forEach((child: any) => {
            const converted = convertComponent(child, id);
            childComponents.push(converted);
          });
        }

        const isFirstLevelUnderPageRoot = parentId === rootId;

        if (
          comp.type === 'Text' &&
          comp.props &&
          typeof comp.props.text === 'string'
        ) {
          const rawText = comp.props.text as string;
          const text = rawText.toLowerCase().trim();
          const looksLikePlaceholder =
            text.startsWith('enter ') ||
            text.startsWith('type ') ||
            text.startsWith('your ');
          const mentionsField =
            text.includes('email') ||
            text.includes('password') ||
            text.includes('username') ||
            text.includes('name');

          if (looksLikePlaceholder && mentionsField) {
            const isPassword = text.includes('password');
            comp = {
              ...comp,
              type: 'Input',
              props: {
                placeholder: rawText,
                type: isPassword ? 'password' : 'text',
              },
            };
          }
        }

        let name: string = comp.name || comp.type;

        if (isFirstLevelUnderPageRoot) {
          const normalized = name.replace(/\d+$/g, '');
          if (genericRootNames.has(normalized)) {
            name = makeRootNameFromPrompt(generatePrompt);
          }
        }

        const props = comp.props || {};
        const styles = comp.styles || {};
        let className = comp.className || '';

        // Tailwind defaults (only when AI didn't provide className)
        if (comp.type === 'Input' && !className) {
          className =
            'w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground';
        } else if (comp.type === 'Button' && !className) {
          const text = (props.text || '').toString().toLowerCase();
          if (text.includes('google')) {
            className =
              'px-4 py-2 rounded-md text-sm font-medium bg-white text-blue-600 border border-border';
          } else if (text.includes('facebook')) {
            className =
              'px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white';
          } else {
            className =
              'px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground';
          }
        }

        return {
          id,
          type: comp.type,
          name,
          parentId,
          props,
          styles,
          className,
          children: childComponents,
          events: comp.events || {},
        };
      };

      if (!rootId) {
        toast.error('No page found. Please create a page first.');
        return;
      }

      const components = getComponents();
      const pageComponent = components[rootId];

      if (replaceMode && pageComponent) {
        const backup = {
          timestamp: Date.now(),
          components: pageComponent.children,
        };
        localStorage.setItem('ai-generator-backup', JSON.stringify(backup));
        updateComponent(rootId, { children: [] });
        toast.info('Previous components backed up');
      }

      const newComponent = convertComponent(component, rootId);

      function countComponents(comp: BuilderComponent): number {
        return (
          1 +
          comp.children.reduce((sum, child) => sum + countComponents(child), 0)
        );
      }

      const componentCount = countComponents(newComponent);

      insertComponentWithData(newComponent, rootId, 'inside');
      addAiComponent(newComponent);

      toast.success(`Generated ${componentCount} components successfully!`);
      setGeneratePrompt('');
    } catch (error: any) {
      console.error('Generate error:', error);
      toast.error(error.message || 'Failed to generate component');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: chatInput,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatting(true);

    try {
      // Get current design context
      const rootId = getRootId();
      const components = getComponents();
      const selectedComponent = selectedId ? components[selectedId] : null;

      const response = await fetch('/api/studio/chat-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          model,
          context: {
            selectedComponent: selectedComponent
              ? {
                  type: selectedComponent.type,
                  name: selectedComponent.name,
                  styles: selectedComponent.styles,
                  props: selectedComponent.props,
                }
              : null,
            componentCount: Object.keys(components).length,
          },
          history: messages.slice(-10),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Apply any style changes if returned
      if (data.styleChanges && selectedId) {
        // chat-design is instructed to return Tailwind className changes
        if (typeof data.styleChanges === 'string') {
          updateComponent(selectedId, { className: data.styleChanges });
          toast.success('Applied Tailwind classes');
        } else if (
          typeof data.styleChanges === 'object' &&
          data.styleChanges !== null &&
          'className' in data.styleChanges &&
          typeof (data.styleChanges as any).className === 'string'
        ) {
          updateComponent(selectedId, {
            className: (data.styleChanges as any).className,
          });
          toast.success('Applied Tailwind classes');
        } else {
          // Back-compat: if the server returns inline styles
          updateComponent(selectedId, { styles: data.styleChanges });
          toast.success('Applied style changes');
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      dragListener={false}
      dragConstraints={{
        left: 0,
        right: typeof window !== 'undefined' ? window.innerWidth - 320 : 1000,
        top: 0,
        bottom: typeof window !== 'undefined' ? window.innerHeight - 100 : 800,
      }}
      style={{
        x: panelPosition.x,
        y: panelPosition.y,
        touchAction: 'none',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}
      onDragStart={() => setIsDraggingPanel(true)}
      onDragEnd={(e, info) => {
        setIsDraggingPanel(false);
        setPanelPosition({ x: info.point.x, y: info.point.y });
      }}
      className="fixed z-50 w-[320px] bg-card border border-border rounded-lg overflow-hidden"
    >
      {/* Drag Handle / Header */}
      <div
        onPointerDown={e => {
          if ((e.target as HTMLElement).closest('button')) return;
          dragControls.start(e);
        }}
        className={cn(
          'border-b border-border',
          isDraggingPanel ? 'cursor-grabbing' : 'cursor-grab',
        )}
      >
        <div className="bg-linear-to-r from-primary/10 to-primary/5 px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <GripVertical size={14} className="text-muted-foreground" />
            <Sparkles size={14} className="text-primary" />
            <h2 className="text-xs font-semibold text-foreground">
              AI Assistant
            </h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              beta
            </span>
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded hover:bg-accent"
          >
            {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex flex-col max-h-[500px]">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('generate')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors',
                activeTab === 'generate'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              <Wand2 size={14} />
              Generate
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors',
                activeTab === 'chat'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              <MessageSquare size={14} />
              Chat
            </button>
          </div>

          {/* Generate Tab */}
          {activeTab === 'generate' && (
            <div className="flex flex-col">
              {/* Generate Input */}
              <div className="p-3 border-b border-border bg-background/50">
                <textarea
                  value={generatePrompt}
                  onChange={e => setGeneratePrompt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleGenerate();
                    }
                  }}
                  placeholder="Describe what you want to build..."
                  className="w-full h-20 px-3 py-2 text-sm bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  disabled={isGenerating}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={replaceMode}
                        onChange={e => setReplaceMode(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-border"
                      />
                      <span className="text-muted-foreground">
                        Replace existing
                      </span>
                    </label>

                    <Select
                      value={model}
                      onValueChange={next => {
                        setModel(next);
                        localStorage.setItem(AI_MODEL_STORAGE_KEY, next);
                      }}
                      disabled={isGenerating || isChatting}
                    >
                      <SelectTrigger className="h-7 px-2 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_MODEL_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !generatePrompt.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        Generate
                      </>
                    )}
                  </button>
                </div>
                {isGenerating && (
                  <div className="mt-2">
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Generated Components List */}
              <div className="flex-1 overflow-y-auto max-h-[250px] p-2 space-y-1.5 bg-background/50">
                {aiComponents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Sparkles className="w-6 h-6 text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      No components yet
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Generate your first component above
                    </p>
                  </div>
                ) : (
                  aiComponents.map(comp => (
                    <div
                      key={comp.id}
                      draggable
                      onDragStart={e => handleDragStart(e, comp)}
                      onDragEnd={handleDragEnd}
                      className="group relative flex items-center gap-2 p-2 rounded-md border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing select-none"
                    >
                      <GripVertical
                        size={12}
                        className="text-muted-foreground"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">
                          {comp.name || comp.type}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {comp.type} • {comp.children.length} children
                        </div>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          removeAiComponent(comp.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all"
                      >
                        <Ban size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[350px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-background/50">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground font-medium">
                      Chat about your design
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1 px-4">
                      Ask questions, request changes, or get suggestions for
                      your current layout
                    </p>
                    <div className="mt-3 space-y-1.5">
                      {[
                        'Make this button more prominent',
                        'Center the content vertically',
                        'Add more spacing between sections',
                      ].map(suggestion => (
                        <button
                          key={suggestion}
                          onClick={() => setChatInput(suggestion)}
                          className="block w-full text-[10px] text-left px-2 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map(msg => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex',
                          msg.role === 'user' ? 'justify-end' : 'justify-start',
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[85%] rounded-lg px-3 py-2 text-xs',
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground',
                          )}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isChatting && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-3 py-2">
                          <Loader2
                            size={14}
                            className="animate-spin text-muted-foreground"
                          />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat actions */}
              {messages.length > 0 && (
                <div className="px-3 py-1 border-t border-border bg-muted/30">
                  <button
                    onClick={() => {
                      setMessages([]);
                      localStorage.removeItem(chatStorageKey);
                    }}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Trash2 size={10} />
                    Clear chat
                  </button>
                </div>
              )}

              {/* Chat Input */}
              <div className="p-2 border-t border-border bg-card">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleChat();
                      }
                    }}
                    placeholder="Ask about your design..."
                    className="flex-1 px-3 py-1.5 text-xs bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isChatting}
                  />
                  <button
                    onClick={handleChat}
                    disabled={isChatting || !chatInput.trim()}
                    className="p-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
