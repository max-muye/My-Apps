import { getOnlineUsers, touchOnlineUser } from "../_presence-store";
import { getClientIp, isAdminRequest } from "../_admin-auth";
import { hasUnbanRequest, isIpBanned } from "../_chat-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return Response.json({ users: getOnlineUsers(isAdminRequest(request)) });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { userId?: unknown; name?: unknown; accountToken?: unknown };
    const userId = typeof body.userId === "string" ? body.userId.trim().slice(0, 80) : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const accountToken = typeof body.accountToken === "string" ? body.accountToken.trim().slice(0, 120) : "";
    if (!userId) return Response.json({ error: "缺少访客 ID" }, { status: 400 });
    const blockKey = getClientIp(request, userId);
    const isAdmin = isAdminRequest(request);
    const presence = touchOnlineUser(userId, name, blockKey, accountToken, isAdmin, isAdmin);
    if (!presence.ok) return Response.json({ error: presence.error, code: presence.code }, { status: presence.status });
    return Response.json({
      users: presence.users,
      currentName: presence.currentName,
      accountToken: presence.accountToken,
      nextNameChangeAt: presence.nextNameChangeAt,
      isBanned: isAdmin ? false : isIpBanned(blockKey),
      hasRequestedUnban: hasUnbanRequest(blockKey),
    });
  } catch {
    return Response.json({ error: "请求格式不正确" }, { status: 400 });
  }
}
