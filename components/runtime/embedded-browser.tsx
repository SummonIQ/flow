/* eslint-disable jsx-a11y/iframe-has-title */
'use client';

import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@summoniq/applab-ui';
import { ExternalLink, Monitor, RefreshCw, Smartphone } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';

import { cn } from '@/lib/utils';

export type ElectronSender =
  | ((channel: string, payload?: unknown) => void)
  | null;

declare global {
  interface Window {
    __flowEmbeddedBrowserMounted?: boolean;
  }
}

const MOBILE_VIEWPORT = { width: 414, height: 896 };

type EmbeddedBrowserProps = {
  initialUrl: string;
  className?: string;
  placeholder?: string;
  partition?: string;
  urlBarEditable?: boolean;
  viewportWidth?: number;
  viewportHeight?: number;
  onViewportChange?: (viewport: { width?: number; height?: number }) => void;
  onElectronSendReady?: (sender: ElectronSender) => void;
  onWebviewReady?: (webview: HTMLElement | null) => void;
  onDidStopLoading?: () => void;
  onIpcMessage?: (event: { channel: string; args: unknown[] }) => void;
  ipcHandlers?: Record<string, (payload: unknown, args: unknown[]) => void>;
};

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function EmbeddedBrowser({
  initialUrl,
  className,
  placeholder = 'Paste a URL (e.g. https://example.com)',
  partition = 'persist:flow',
  urlBarEditable = false,
  viewportWidth,
  viewportHeight,
  onViewportChange,
  onElectronSendReady,
  onWebviewReady,
  onDidStopLoading,
  onIpcMessage,
  ipcHandlers,
}: EmbeddedBrowserProps) {
  const resolvedInitial = useMemo(() => normalizeUrl(initialUrl), [initialUrl]);
  const previousResolvedInitialRef = useRef(resolvedInitial);
  const [url, setUrl] = useState(resolvedInitial);
  const [input, setInput] = useState(resolvedInitial);
  const [requiresManualLoad, setRequiresManualLoad] = useState(false);
  const [webviewPreload, setWebviewPreload] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [viewportMode, setViewportMode] = useState<
    'desktop' | 'mobile' | 'custom'
  >(viewportWidth || viewportHeight ? 'custom' : 'desktop');
  const [customWidth, setCustomWidth] = useState(
    viewportWidth ? String(viewportWidth) : '',
  );
  const [customHeight, setCustomHeight] = useState(
    viewportHeight ? String(viewportHeight) : '',
  );
  const webviewRef = useRef<HTMLElement | null>(null);
  const [webviewNode, setWebviewNode] = useState<HTMLElement | null>(null);
  const onWebviewReadyRef = useRef(onWebviewReady);
  const onIpcMessageRef = useRef(onIpcMessage);
  const ipcHandlersRef = useRef(ipcHandlers);
  const onDidStopLoadingRef = useRef(onDidStopLoading);
  const onElectronSendReadyRef = useRef(onElectronSendReady);
  const viewportContainerRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const domReadyRef = useRef(false);
  const sendQueueRef = useRef<Array<{ channel: string; payload?: unknown }>>(
    [],
  );

  useEffect(() => {
    onWebviewReadyRef.current = onWebviewReady;
  }, [onWebviewReady]);

  useEffect(() => {
    onIpcMessageRef.current = onIpcMessage;
  }, [onIpcMessage]);

  useEffect(() => {
    ipcHandlersRef.current = ipcHandlers;
  }, [ipcHandlers]);

  useEffect(() => {
    onDidStopLoadingRef.current = onDidStopLoading;
  }, [onDidStopLoading]);

  useEffect(() => {
    onElectronSendReadyRef.current = onElectronSendReady;
  }, [onElectronSendReady]);

  const handleWebviewRef = useCallback((node: HTMLElement | null) => {
    webviewRef.current = node;
    setWebviewNode(prev => (prev === node ? prev : node));
    onWebviewReadyRef.current?.(node);
  }, []);
  useEffect(() => {
    setIsClient(true);
    const detected =
      typeof window !== 'undefined' &&
      ('electron' in window ||
        globalThis.navigator?.userAgent?.includes('Electron'));
    setIsElectron(Boolean(detected));

    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      if (window.__flowEmbeddedBrowserMounted) {
        setRequiresManualLoad(true);
      }
      window.__flowEmbeddedBrowserMounted = true;
    }
  }, []);

  useEffect(() => {
    const previousResolvedInitial = previousResolvedInitialRef.current;
    previousResolvedInitialRef.current = resolvedInitial;

    // During Fast Refresh, this effect re-runs. Only follow initialUrl if the
    // current state still matches the previous initial value (no user navigation yet).
    setUrl(current =>
      !current || current === previousResolvedInitial ? resolvedInitial : current,
    );
    setInput(current =>
      !current || current === previousResolvedInitial ? resolvedInitial : current,
    );
  }, [resolvedInitial]);

  useEffect(() => {
    if (!viewportWidth && !viewportHeight) {
      setViewportMode('desktop');
      setCustomWidth('');
      setCustomHeight('');
      return;
    }

    if (
      viewportWidth === MOBILE_VIEWPORT.width &&
      viewportHeight === MOBILE_VIEWPORT.height
    ) {
      setViewportMode('mobile');
      setCustomWidth(String(MOBILE_VIEWPORT.width));
      setCustomHeight(String(MOBILE_VIEWPORT.height));
      return;
    }

    setViewportMode('custom');
    setCustomWidth(viewportWidth ? String(viewportWidth) : '');
    setCustomHeight(viewportHeight ? String(viewportHeight) : '');
  }, [viewportHeight, viewportWidth]);

  useEffect(() => {
    let cancelled = false;

    async function loadPreload() {
      if (!isElectron) return;
      const api = typeof window !== 'undefined' ? window.electron : undefined;
      if (!api?.webview?.getPreloadPath) return;
      try {
        const preloadPath = await api.webview.getPreloadPath();
        if (!cancelled) setWebviewPreload(preloadPath);
      } catch {
        if (!cancelled) setWebviewPreload(null);
      }
    }

    void loadPreload();
    return () => {
      cancelled = true;
    };
  }, [isElectron]);

  useEffect(() => {
    if (!isElectron) return;
    const webview = webviewNode as any;
    if (!webview) return;

    const handleIpcMessage = (event: any) => {
      if (!event || typeof event.channel !== 'string') return;
      const args = Array.isArray(event.args) ? (event.args as unknown[]) : [];
      onIpcMessageRef.current?.({ channel: event.channel, args });
      const handler = ipcHandlersRef.current?.[event.channel];
      if (handler) {
        handler(args[0], args);
      }
    };

    webview.addEventListener('ipc-message', handleIpcMessage);
    return () => {
      webview.removeEventListener('ipc-message', handleIpcMessage);
    };
  }, [isElectron, webviewNode]);

  useEffect(() => {
    if (!isElectron) {
      onElectronSendReadyRef.current?.(null);
      return;
    }

    domReadyRef.current = false;
    sendQueueRef.current = [];

    const webview = webviewNode as any;
    if (!webview) {
      onElectronSendReadyRef.current?.(null);
      return;
    }

    const flushQueue = () => {
      const current = webviewRef.current as any;
      if (!domReadyRef.current) return;
      if (!current?.send) return;

      const queue = sendQueueRef.current;
      if (queue.length === 0) return;
      sendQueueRef.current = [];

      for (const item of queue) {
        try {
          current.send(item.channel, item.payload);
        } catch {
          // If Electron isn't ready yet for any reason, put it back and retry on next dom-ready.
          sendQueueRef.current = [item, ...sendQueueRef.current];
          break;
        }
      }
    };

    const handleDomReady = () => {
      domReadyRef.current = true;
      flushQueue();
    };

    webview.addEventListener('dom-ready', handleDomReady);

    onElectronSendReadyRef.current?.((channel: string, payload?: unknown) => {
      const current = webviewRef.current as any;
      if (!domReadyRef.current || !current?.send) {
        sendQueueRef.current = [...sendQueueRef.current, { channel, payload }];
        return;
      }
      current.send(channel, payload);
    });

    return () => {
      webview.removeEventListener('dom-ready', handleDomReady);
      domReadyRef.current = false;
      sendQueueRef.current = [];
      onElectronSendReadyRef.current?.(null);
    };
  }, [isElectron, webviewNode]);

  useEffect(() => {
    if (!isElectron) return;
    const webview = webviewNode as any;
    if (!webview) return;

    const handleStopLoading = () => {
      onDidStopLoadingRef.current?.();
    };

    webview.addEventListener('did-stop-loading', handleStopLoading);
    return () => {
      webview.removeEventListener('did-stop-loading', handleStopLoading);
    };
  }, [isElectron, webviewNode]);

  const handleRefresh = () => {
    if (requiresManualLoad) {
      const next = normalizeUrl(input || url || initialUrl);
      if (next) {
        setUrl(next);
        setInput(next);
      }
      setRequiresManualLoad(false);
      return;
    }

    const webview = webviewRef.current as any;
    if (isElectron && webview?.reload) {
      webview.reload();
      return;
    }
    setUrl(prev => prev);
    setInput(prev => prev);
  };

  useEffect(() => {
    const container = viewportContainerRef.current;
    if (!container) return;

    const updateSize = (width: number, height: number) => {
      if (!width || !height) return;

      if (viewportMode === 'desktop') {
        setViewportSize({ width, height });
        return;
      }

      const desiredWidth =
        viewportMode === 'mobile'
          ? MOBILE_VIEWPORT.width
          : Number(customWidth) || viewportWidth || 360;
      const desiredHeight =
        viewportMode === 'mobile'
          ? MOBILE_VIEWPORT.height
          : Number(customHeight) || viewportHeight || 640;

      const scale = Math.min(width / desiredWidth, height / desiredHeight);
      setViewportSize({
        width: Math.max(1, desiredWidth * scale),
        height: Math.max(1, desiredHeight * scale),
      });
    };

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      updateSize(entry.contentRect.width, entry.contentRect.height);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [customHeight, customWidth, viewportHeight, viewportMode, viewportWidth]);

  const viewportStyle =
    viewportMode !== 'desktop' && viewportSize.width && viewportSize.height
      ? {
          width: `${viewportSize.width}px`,
          height: `${viewportSize.height}px`,
        }
      : undefined;

  const applyViewport = (next: { width?: number; height?: number }) => {
    onViewportChange?.(next);
  };

  const selectPreset = (mode: 'desktop' | 'mobile' | 'custom') => {
    setViewportMode(mode);
    if (mode === 'desktop') {
      setCustomWidth('');
      setCustomHeight('');
      applyViewport({ width: undefined, height: undefined });
      return;
    }
    if (mode === 'mobile') {
      setCustomWidth(String(MOBILE_VIEWPORT.width));
      setCustomHeight(String(MOBILE_VIEWPORT.height));
      applyViewport({
        width: MOBILE_VIEWPORT.width,
        height: MOBILE_VIEWPORT.height,
      });
      return;
    }
    applyViewport({
      width: customWidth ? Number(customWidth) : undefined,
      height: customHeight ? Number(customHeight) : undefined,
    });
  };

  const previewSize = (() => {
    if (viewportMode === 'mobile') {
      return {
        width: MOBILE_VIEWPORT.width,
        height: MOBILE_VIEWPORT.height,
      };
    }
    if (viewportMode === 'custom') {
      const width = Number(customWidth) || 360;
      const height = Number(customHeight) || 640;
      return { width, height };
    }
    return { width: 16, height: 9 };
  })();

  const activeUrl = requiresManualLoad ? 'about:blank' : url;

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col gap-2 h-full', className)}>
      <div className="flex flex-nowrap items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2 py-1">
        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={handleRefresh}>
          <RefreshCw className={cn('h-3.5 w-3.5', requiresManualLoad && 'text-teal-300')} />
        </Button>
        <Input
          value={input}
          readOnly={!urlBarEditable}
          placeholder={placeholder}
          className="h-8 min-w-0 flex-1 text-xs"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (!urlBarEditable) return;
            setInput(event.target.value);
          }}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (!urlBarEditable) return;
            if (event.key !== 'Enter') return;
            const next = normalizeUrl(input);
            if (next && next !== url) {
              setUrl(next);
              setInput(next);
            }
          }}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 px-2 text-xs">
              {viewportMode === 'mobile' ? (
                <Smartphone className="h-3.5 w-3.5" />
              ) : (
                <Monitor className="h-3.5 w-3.5" />
              )}
              {viewportMode === 'mobile'
                ? 'Mobile'
                : viewportMode === 'custom'
                  ? 'Custom'
                  : 'Desktop'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="space-y-3">
              <div className="text-xs font-semibold">Viewport</div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant={viewportMode === 'desktop' ? 'default' : 'secondary'}
                  className="h-auto flex-col gap-2 py-2"
                  onClick={() => selectPreset('desktop')}
                >
                  <div className="h-8 w-12 rounded-md border border-border/60 bg-muted/30 p-1">
                    <div className="h-full w-full rounded-sm bg-foreground/10" />
                  </div>
                  Desktop
                </Button>
                <Button
                  size="sm"
                  variant={viewportMode === 'mobile' ? 'default' : 'secondary'}
                  className="h-auto flex-col gap-2 py-2"
                  onClick={() => selectPreset('mobile')}
                >
                  <div className="h-8 w-6 rounded-md border border-border/60 bg-muted/30 p-1">
                    <div className="h-full w-full rounded-sm bg-foreground/10" />
                  </div>
                  Mobile
                </Button>
                <Button
                  size="sm"
                  variant={viewportMode === 'custom' ? 'default' : 'secondary'}
                  className="h-auto flex-col gap-2 py-2"
                  onClick={() => selectPreset('custom')}
                >
                  <div className="h-8 w-10 rounded-md border border-border/60 bg-muted/30 p-1">
                    <div className="h-full w-full rounded-sm bg-foreground/10" />
                  </div>
                  Custom
                </Button>
              </div>
              {viewportMode === 'custom' ? (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    className="h-8"
                    placeholder="Width"
                    value={customWidth}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setViewportMode('custom');
                      setCustomWidth(event.target.value);
                    }}
                    onBlur={() =>
                      applyViewport({
                        width: customWidth ? Number(customWidth) : undefined,
                        height: customHeight ? Number(customHeight) : undefined,
                      })
                    }
                  />
                  <Input
                    className="h-8"
                    placeholder="Height"
                    value={customHeight}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setViewportMode('custom');
                      setCustomHeight(event.target.value);
                    }}
                    onBlur={() =>
                      applyViewport({
                        width: customWidth ? Number(customWidth) : undefined,
                        height: customHeight ? Number(customHeight) : undefined,
                      })
                    }
                  />
                </div>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-border/60 bg-background">
        {isClient && isElectron ? (
          <div
            ref={viewportContainerRef}
            className={cn(
              'relative flex min-h-0 flex-1 transition-[align-items,justify-content] duration-300 ease-out',
              viewportStyle
                ? 'items-center justify-center'
                : 'items-stretch justify-stretch',
            )}
          >
            <webview
              src={activeUrl}
              preload={webviewPreload ?? undefined}
              className={cn(
                'min-h-0 rounded-xl transition-[width,height,transform] duration-300 ease-out',
                viewportMode === 'desktop' ? 'flex-1' : 'flex-none',
              )}
              partition={partition}
              ref={handleWebviewRef}
              style={{
                flex: viewportMode === 'desktop' ? 1 : '0 0 auto',
                ...viewportStyle,
              }}
            />
            {requiresManualLoad ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="pointer-events-auto rounded-lg border border-border/70 bg-background/92 px-3 py-2 text-xs text-muted-foreground shadow-lg">
                  <div className="mb-2 text-foreground">Hot reload paused browser requests.</div>
                  <Button size="sm" onClick={handleRefresh}>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Load page
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="text-sm font-medium text-foreground">
              This page can’t be embedded in the web app
            </div>
            <div className="max-w-[520px] text-sm text-muted-foreground">
              Some sites block being displayed inside an iframe. Use the
              external link to open it in your default browser, or run Flow in
              Electron to browse inside the app.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button asChild>
                <a href={url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open page
                </a>
              </Button>
              <Button variant="secondary" onClick={() => setInput(url)}>
                Copy URL to bar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
