import { banIp, checkMessageAbuse, createMessage, getPublicMessages, isIpBanned, toPublicMessage } from "../_chat-store";
import { getClientIp, isAdminRequest } from "../_admin-auth";
import { authenticateAccount, getRegisteredUserName } from "../_presence-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ messages: getPublicMessages() });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { userId?: unknown; text?: unknown; accountToken?: unknown };
    const userId = typeof body.userId === "string" ? body.userId.trim().slice(0, 80) : "guest";
    const text = typeof body.text === "string" ? body.text.trim().slice(0, 2000) : "";
    const accountToken = typeof body.accountToken === "string" ? body.accountToken.trim().slice(0, 120) : "";
    const ipAddress = getClientIp(request, userId || "guest");
    const isAdmin = isAdminRequest(request);
    const registeredName = getRegisteredUserName(userId);

    if (!text) return Response.json({ error: "消息不能为空" }, { status: 400 });
    if (!authenticateAccount(userId, ipAddress, accountToken, isAdmin)) {
      return Response.json({ error: "账户凭证无效", code: "ACCOUNT_TOKEN_INVALID" }, { status: 403 });
    }
    if (!isAdmin && isIpBanned(ipAddress)) return Response.json({ error: "你已被管理员封禁" }, { status: 403 });
    if (!registeredName) return Response.json({ error: "请先完成名称登记" }, { status: 409 });

    const abuseReason = isAdmin ? null : checkMessageAbuse(ipAddress, text);
    if (abuseReason) {
      banIp(ipAddress, registeredName, abuseReason);
      return Response.json(
        { error: "发送行为异常，已自动封禁", autoBanned: true, reason: abuseReason },
        { status: 403 },
      );
    }
    return Response.json(toPublicMessage(createMessage(userId, registeredName, text, ipAddress)));
  } catch {
    return Response.json({ error: "请求格式不正确" }, { status: 400 });
  }
}
