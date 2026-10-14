import { clearMessages, deleteMessage, getBannedUsers, getMessages, getUnbanRequests } from "../../_chat-store";
import { isAdminRequest } from "../../_admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return Response.json({ error: "仅 localhost 管理员可访问" }, { status: 403 });
  return Response.json({ messages: getMessages(), bannedUsers: getBannedUsers(), unbanRequests: getUnbanRequests() });
}

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) return Response.json({ error: "仅 localhost 管理员可访问" }, { status: 403 });

  const url = new URL(request.url);
  if (url.searchParams.get("all") === "true") {
    clearMessages();
    return Response.json({ cleared: true });
  }

  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "缺少消息 ID" }, { status: 400 });
  if (!deleteMessage(id)) return Response.json({ error: "消息不存在" }, { status: 404 });
  return Response.json({ deleted: true, id });
}
