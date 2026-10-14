import { getClientIp, isAdminRequest } from "../_admin-auth";
import { isIpBanned, requestUnban } from "../_chat-store";
import { authenticateAccount, getRegisteredUserName } from "../_presence-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { userId?: unknown; accountToken?: unknown };
    const userId = typeof body.userId === "string" ? body.userId.trim().slice(0, 80) : "";
    const accountToken = typeof body.accountToken === "string" ? body.accountToken.trim().slice(0, 120) : "";
    if (!userId) return Response.json({ error: "缺少访客 ID" }, { status: 400 });

    const blockKey = getClientIp(request, userId);
    if (!authenticateAccount(userId, blockKey, accountToken, isAdminRequest(request))) {
      return Response.json({ error: "账户凭证无效", code: "ACCOUNT_TOKEN_INVALID" }, { status: 403 });
    }
    if (!isIpBanned(blockKey)) return Response.json({ error: "你目前未被封禁" }, { status: 400 });
    const unbanRequest = requestUnban(blockKey, getRegisteredUserName(userId) || "访客");
    if (!unbanRequest) return Response.json({ error: "已经申请过解封" }, { status: 409 });
    return Response.json({ requested: true });
  } catch {
    return Response.json({ error: "请求格式不正确" }, { status: 400 });
  }
}
