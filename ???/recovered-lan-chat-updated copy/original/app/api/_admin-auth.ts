export function isAdminRequest(request: Request) {
  const hostname = new URL(request.url).hostname.replace(/^\[/, "").replace(/\]$/, "");
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function getClientIp(request: Request, userId: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",").map((value) => value.trim()) || [];
  const cloudflare = request.headers.get("cf-connecting-ip")?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const candidates = [...forwarded, realIp, cloudflare].filter((value): value is string => Boolean(value));
  const normalized = candidates.map((value) => value.replace(/^::ffff:/, ""));
  const loopbackAddresses = new Set(["127.0.0.1", "::1", "localhost"]);

  const remoteAddress = normalized.find((value) => !loopbackAddresses.has(value));
  if (remoteAddress) return remoteAddress;
  if (isAdminRequest(request) && normalized[0]) return normalized[0];

  // Local reverse proxies may report every LAN visitor as 127.0.0.1. Treating
  // that as a shared visitor IP would lock every computer to the first account.
  return `visitor:${userId}`;
}
