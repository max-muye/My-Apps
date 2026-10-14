import { getClientIp, isAdminRequest } from "../../_admin-auth";
import { isIpBanned } from "../../_chat-store";
import { authenticateAccount, changeUserName } from "../../_presence-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { userId?: unknown; name?: unknown; accountToken?: unknown };
    const userId = typeof body.userId === "string" ? body.userId.trim().slice(0, 80) : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const accountToken = typeof body.accountToken === "string" ? body.accountToken.trim().slice(0, 120) : "";
    if (!userId) return Response.json({ error: "缺少访客 ID" }, { status: 400 });
    const blockKey = getClientIp(request, userId);
    const isAdmin = isAdminRequest(request);
    if (!authenticateAccount(userId, blockKey, accountToken, isAdmin)) {
      return Response.json({ error: "账户凭证无效", code: "ACCOUNT_TOKEN_INVALID" }, { status: 403 });
    }
    if (!isAdmin && isIpBanned(blockKey)) {
      return Response.json({ error: "你已被封禁，无法修改名称" }, { status: 403 });
    }

    const result = changeUserName(userId, name);
    if (!result.ok) {
      return Response.json(
        { error: result.error, retryAfterMs: result.retryAfterMs, nextNameChangeAt: result.nextNameChangeAt },
        { status: result.status },
      );
    }
    return Response.json(result);
  } catch {
    return Response.json({ error: "请求格式不正确" }, { status: 400 });
  }
}
