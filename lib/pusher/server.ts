import Pusher from 'pusher';

let pusherInstance: Pusher | null = null;
let pusherDisabled = false;

export function isPusherServerEnabled(): boolean {
  return Boolean(
    process.env.PUSHER_APP_ID &&
      process.env.PUSHER_KEY &&
      process.env.PUSHER_SECRET,
  );
}

export function getPusherServer(): Pusher | null {
  if (pusherDisabled) {
    return null;
  }

  if (!isPusherServerEnabled()) {
    if (!pusherDisabled) {
      console.warn(
        '[Pusher] Server env vars not set (PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET) - realtime triggers disabled',
      );
      pusherDisabled = true;
    }
    return null;
  }

  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER || 'us3',
      useTLS: true,
    });
  }
  return pusherInstance;
}

export async function triggerTicketUpdate(
  projectName: string,
  ticket: {
    id: string;
    status: string;
    assignedToId?: string | null;
    [key: string]: any;
  },
) {
  const pusher = getPusherServer();
  if (!pusher) return;

  await pusher.trigger(`project-${projectName}`, 'ticket-updated', {
    ticket,
    timestamp: new Date().toISOString(),
  });
}

export async function triggerTicketCreated(projectName: string, ticket: any) {
  const pusher = getPusherServer();
  if (!pusher) return;

  await pusher.trigger(`project-${projectName}`, 'ticket-created', {
    ticket,
    timestamp: new Date().toISOString(),
  });
}

export async function triggerTicketDeleted(
  projectName: string,
  ticketId: string,
) {
  const pusher = getPusherServer();
  if (!pusher) return;

  await pusher.trigger(`project-${projectName}`, 'ticket-deleted', {
    ticketId,
    timestamp: new Date().toISOString(),
  });
}
