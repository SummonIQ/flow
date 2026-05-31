'use client';

import { useEffect, useState } from 'react';

export function HeroBackground() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const sync = () => setPrefersReducedMotion(mq.matches);
    sync();

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', sync);
      return () => mq.removeEventListener('change', sync);
    }

    mq.addListener(sync);
    return () => mq.removeListener(sync);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className={
            prefersReducedMotion
              ? 'absolute -top-72 left-1/2 h-[760px] w-[1320px] -translate-x-1/2 opacity-80 blur-2xl mix-blend-multiply saturate-150 dark:mix-blend-screen'
              : 'absolute -top-72 left-1/2 h-[760px] w-[1320px] -translate-x-1/2 opacity-80 blur-2xl mix-blend-multiply saturate-150 dark:mix-blend-screen animate-[aurora-drift_16s_ease-in-out_infinite]'
          }
          style={{
            background:
              'conic-gradient(from 220deg at 50% 35%, rgba(255,0,128,0.24), rgba(168,85,247,0.26), rgba(59,130,246,0.28), rgba(34,211,238,0.28), rgba(20,184,166,0.22), rgba(250,204,21,0.18), rgba(255,0,128,0.24))',
            maskImage:
              'radial-gradient(ellipse at top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0) 72%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0) 72%)',
          }}
        />

        <div
          className={
            prefersReducedMotion
              ? 'absolute -top-60 left-1/2 h-[660px] w-[1200px] -translate-x-1/2 opacity-70 blur-2xl mix-blend-multiply saturate-150 dark:mix-blend-screen'
              : 'absolute -top-60 left-1/2 h-[660px] w-[1200px] -translate-x-1/2 opacity-70 blur-2xl mix-blend-multiply saturate-150 dark:mix-blend-screen animate-[aurora-drift-reverse_22s_ease-in-out_infinite]'
          }
          style={{
            background:
              'conic-gradient(from 140deg at 50% 35%, rgba(34,211,238,0.20), rgba(59,130,246,0.22), rgba(168,85,247,0.22), rgba(236,72,153,0.16), rgba(250,204,21,0.14), rgba(20,184,166,0.18), rgba(34,211,238,0.20))',
            maskImage:
              'radial-gradient(ellipse at top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 48%, rgba(0,0,0,0) 75%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 48%, rgba(0,0,0,0) 75%)',
          }}
        />
      </div>
      <div
        aria-hidden="true"
        className={
          prefersReducedMotion
            ? 'pointer-events-none absolute inset-0 opacity-50 mix-blend-soft-light bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.22),rgba(255,255,255,0)_58%)] dark:opacity-40 dark:mix-blend-normal dark:bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),rgba(0,0,0,0)_60%)]'
            : 'pointer-events-none absolute inset-0 opacity-50 mix-blend-soft-light bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.22),rgba(255,255,255,0)_58%)] dark:opacity-40 dark:mix-blend-normal dark:bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),rgba(0,0,0,0)_60%)] animate-[hue-sweep_14s_ease-in-out_infinite]'
        }
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[56px_56px] mask-[radial-gradient(ellipse_at_top,black_35%,transparent_72%)] dark:opacity-30"
      />
    </div>
  );
}
