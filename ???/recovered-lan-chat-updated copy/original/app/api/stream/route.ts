import { subscribe, toPublicMessage } from "../_chat-store";
import { getOnlineUsers, subscribePresence } from "../_presence-store";
import { isAdminRequest } from "../_admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  let close: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: Parameters<Parameters<typeof subscribe>[0]>[0]) => {
        try {
          if (event.type === "unban-request" && !isAdminRequest(request)) return;
          if (event.type === "message") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(toPublicMessage(event.message))}\n\n`));
          } else {
            controller.enqueue(encoder.encode(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`));
          }
        } catch {
          close?.();
        }
      };

      controller.enqueue(encoder.encode(": connected\n\n"));
      const unsubscribe = subscribe(send);
      const unsubscribePresence = subscribePresence(() => {
        try {
          controller.enqueue(encoder.encode(`event: presence\ndata: ${JSON.stringify({ users: getOnlineUsers(isAdminRequest(request)) })}\n\n`));
        } catch {
          close?.();
        }
      });
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          close?.();
        }
      }, 15000);
      close = () => {
        clearInterval(heartbeat);
        unsubscribe();
        unsubscribePresence();
        try { controller.close(); } catch { /* already closed */ }
      };
    },
    cancel() { close?.(); },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}
