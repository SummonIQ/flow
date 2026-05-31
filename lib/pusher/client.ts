'use client';

import Pusher from 'pusher-js';

let pusherInstance: Pusher | null = null;
let pusherDisabled = false;

export function isPusherEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_PUSHER_KEY);
}

export function getPusherClient(): Pusher {
  if (pusherDisabled) {
    // Return a no-op mock that won't crash
    return createNoOpPusher();
  }

  if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
    console.warn(
      '[Pusher] NEXT_PUBLIC_PUSHER_KEY not set - realtime features disabled',
    );
    pusherDisabled = true;
    return createNoOpPusher();
  }

  if (!pusherInstance) {
    pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us3',
    });
  }
  return pusherInstance;
}

// No-op Pusher mock for when env vars are missing
function createNoOpPusher(): Pusher {
  return {
    subscribe: () => ({
      bind: () => {},
      unbind: () => {},
      unbind_all: () => {},
      trigger: () => {},
    }),
    unsubscribe: () => {},
    disconnect: () => {},
    connection: { state: 'disconnected' },
  } as unknown as Pusher;
}
