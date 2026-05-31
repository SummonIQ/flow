/* eslint-disable jsx-a11y/iframe-has-title */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  EmbeddedBrowser,
  type ElectronSender,
} from '@/components/runtime/embedded-browser';

type UpworkEmbeddedBrowserProps = {
  initialUrl: string;
  className?: string;
  placeholder?: string;
  onUpworkJobExtracted?: (payload: unknown) => void;
  onUpworkJobsExtracted?: (payload: unknown) => void;
  onUpworkHtmlExtracted?: (payload: unknown) => void;
  onUpworkDetailHtmlExtracted?: (payload: unknown) => void;
  onUpworkSubmitEvent?: (payload: unknown) => void;
  onElectronSendReady?: (sender: ElectronSender) => void;
  onWebviewReady?: (webview: HTMLElement | null) => void;
};

export function UpworkEmbeddedBrowser({
  initialUrl,
  className,
  placeholder = 'Paste a URL (e.g. https://www.upwork.com/nx/jobs/search)',
  onUpworkJobExtracted,
  onUpworkJobsExtracted,
  onUpworkHtmlExtracted,
  onUpworkDetailHtmlExtracted,
  onUpworkSubmitEvent,
  onElectronSendReady,
  onWebviewReady,
}: UpworkEmbeddedBrowserProps) {
  const [electronSend, setElectronSend] = useState<ElectronSender>(null);
  const [extractorReady, setExtractorReady] = useState(false);
  const extractAllTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const scheduleExtractAll = useMemo(() => {
    return () => {
      if (!extractorReady) return;
      if (!electronSend) return;

      if (extractAllTimeoutId.current) {
        clearTimeout(extractAllTimeoutId.current);
      }
      extractAllTimeoutId.current = setTimeout(() => {
        electronSend('flow:extractAll');
      }, 250);
    };
  }, [electronSend, extractorReady]);

  useEffect(() => {
    if (!extractorReady) return;
    scheduleExtractAll();
  }, [extractorReady, scheduleExtractAll]);

  useEffect(() => {
    return () => {
      if (extractAllTimeoutId.current) {
        clearTimeout(extractAllTimeoutId.current);
      }
    };
  }, []);

  const handleElectronSendReady = useCallback(
    (sender: ElectronSender) => {
      setElectronSend((prev: ElectronSender) =>
        prev === sender ? prev : sender,
      );
      onElectronSendReady?.(sender);
    },
    [onElectronSendReady],
  );

  return (
    <EmbeddedBrowser
      initialUrl={initialUrl}
      className={className}
      placeholder={placeholder}
      partition="persist:upwork"
      onElectronSendReady={handleElectronSendReady}
      onWebviewReady={onWebviewReady}
      onDidStopLoading={() => {
        scheduleExtractAll();
      }}
      ipcHandlers={{
        'flow:upworkJob': payload => {
          onUpworkJobExtracted?.(payload);
        },
        'flow:upworkJobs': payload => {
          onUpworkJobsExtracted?.(payload);
        },
        'flow:upworkHtml': payload => {
          onUpworkHtmlExtracted?.(payload);
        },
        'flow:upworkDetailHtml': payload => {
          onUpworkDetailHtmlExtracted?.(payload);
        },
        'flow:upworkSubmit': payload => {
          onUpworkSubmitEvent?.(payload);
        },
        'flow:upwork': () => {
          setExtractorReady(true);
        },
      }}
    />
  );
}
