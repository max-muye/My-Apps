import { banIp, getBannedUsers, unbanIp } from "../../_chat-store";
import { isAdminRequest } from "../../_admin-auth";
import { isProtectedAdminBlockKey } from "../../_presence-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return Response.json({ error: "仅 localhost 管理员可访问" }, { status: 403 });
  const body = (await request.json()) as { ipAddress?: unknown; name?: unknown };
  const ipAddress = typeof body.ipAddress === "string" ? body.ipAddress.trim().slice(0, 120) : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 20) : "未知访客";
  if (!ipAddress || ipAddress === "system") return Response.json({ error: "IP 无效" }, { status: 400 });
  if (isProtectedAdminBlockKey(ipAddress)) {
    return Response.json({ error: "管理员账户不能被封禁" }, { status: 400 });
  }
  banIp(ipAddress, name || "未知访客");
  return Response.json({ banned: true, bannedUsers: getBannedUsers() });
}

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) return Response.json({ error: "仅 localhost 管理员可访问" }, { status: 403 });
  const ipAddress = new URL(request.url).searchParams.get("ip")?.trim() || "";
  if (!ipAddress) return Response.json({ error: "IP 无效" }, { status: 400 });
  unbanIp(ipAddress);
  return Response.json({ banned: false, bannedUsers: getBannedUsers() });
}
