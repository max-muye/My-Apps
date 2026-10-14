type PresenceRecord = {
  userId: string;
  name: string;
  lastSeenAt: number;
  blockKey: string;
  isAdmin: boolean;
};

type UserProfile = {
  userId: string;
  name: string;
  lastNameChangeAt: number;
  accountToken: string;
};

type NameChangeResult =
  | { ok: true; name: string; nextNameChangeAt: number }
  | { ok: false; error: string; status: 400 | 404 | 409 | 429; retryAfterMs?: number; nextNameChangeAt?: number };

export const NAME_CHANGE_COOLDOWN_MS = 5 * 60_000;
const PRESENCE_TIMEOUT_MS = 45_000;
const users = new Map<string, PresenceRecord>();
const profiles = new Map<string, UserProfile>();
const accountsByBlockKey = new Map<string, string>();
const protectedAdminBlockKeys = new Set<string>();
const subscribers = new Set<() => void>();
const INVISIBLE_NAME_CHARACTERS = /[\u0000-\u001F\u007F-\u009F\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E\u200B\u200E\u200F\u202A-\u202E\u2060-\u2064\u206A-\u206F\u3164\uFEFF]/gu;

function cleanName(name: string) {
  return name.replace(INVISIBLE_NAME_CHARACTERS, "").replace(/\s+/gu, " ").trim();
}

function normalizeName(name: string) {
  return cleanName(name).toLocaleLowerCase("zh-CN");
}

function findNameOwner(name: string) {
  const normalized = normalizeName(name);
  return [...profiles.values()].find((profile) => normalizeName(profile.name) === normalized);
}

function validateName(name: string) {
  const trimmed = cleanName(name);
  if (!trimmed) return { ok: false as const, error: "名称不能为空" };
  if (trimmed.length > 20) return { ok: false as const, error: "名称最多 20 个字符" };
  return { ok: true as const, name: trimmed };
}

function prune() {
  const cutoff = Date.now() - PRESENCE_TIMEOUT_MS;
  let changed = false;
  users.forEach((user, userId) => {
    if (user.lastSeenAt < cutoff) {
      users.delete(userId);
      changed = true;
    }
  });
  return changed;
}

function serializeUsers(includeBlockKey = false) {
  return [...users.values()]
    .sort((left, right) => left.lastSeenAt - right.lastSeenAt)
    .map(({ userId, name, blockKey, isAdmin }) => ({
      userId,
      name,
      isAdmin,
      ...(includeBlockKey ? { blockKey } : {}),
    }));
}

function notify() {
  subscribers.forEach((listener) => listener());
}

export function getOnlineUsers(includeBlockKey = false) {
  prune();
  return serializeUsers(includeBlockKey);
}

export function touchOnlineUser(
  userId: string,
  requestedName: string,
  blockKey: string,
  accountToken: string,
  includeBlockKey = false,
  allowMultipleAccounts = false,
) {
  const validation = validateName(requestedName);
  if (!validation.ok) return { ok: false as const, error: validation.error, status: 400 as const };

  const accountBindingKey = allowMultipleAccounts ? `${blockKey}:admin:${userId}` : blockKey;
  if (allowMultipleAccounts) protectedAdminBlockKeys.add(blockKey);
  const boundUserId = accountsByBlockKey.get(accountBindingKey);
  if (boundUserId && boundUserId !== userId) {
    return {
      ok: false as const,
      error: "此 IP 已绑定一个账户，请使用原浏览器进入",
      code: "IP_ACCOUNT_CONFLICT" as const,
      status: 403 as const,
    };
  }

  let profile = profiles.get(userId);
  if (!profile) {
    const owner = findNameOwner(validation.name);
    if (owner && owner.userId !== userId) {
      return { ok: false as const, error: "该名称已被使用", status: 409 as const };
    }
    profile = { userId, name: validation.name, lastNameChangeAt: 0, accountToken: crypto.randomUUID() };
    profiles.set(userId, profile);
  } else if (!accountToken || accountToken !== profile.accountToken) {
    return {
      ok: false as const,
      error: "账户凭证无效，请使用首次进入聊天室的普通浏览器",
      code: "ACCOUNT_TOKEN_INVALID" as const,
      status: 403 as const,
    };
  }
  accountsByBlockKey.set(accountBindingKey, userId);

  const pruned = prune();
  const previous = users.get(userId);
  users.set(userId, { userId, name: profile.name, blockKey, isAdmin: allowMultipleAccounts, lastSeenAt: Date.now() });
  if (pruned || !previous || previous.name !== profile.name || previous.blockKey !== blockKey) notify();

  return {
    ok: true as const,
    users: serializeUsers(includeBlockKey),
    currentName: profile.name,
    accountToken: profile.accountToken,
    nextNameChangeAt: profile.lastNameChangeAt ? profile.lastNameChangeAt + NAME_CHANGE_COOLDOWN_MS : 0,
  };
}

export function authenticateAccount(userId: string, blockKey: string, accountToken: string, allowMultipleAccounts = false) {
  const profile = profiles.get(userId);
  const accountBindingKey = allowMultipleAccounts ? `${blockKey}:admin:${userId}` : blockKey;
  return Boolean(
    profile
    && accountToken
    && profile.accountToken === accountToken
    && accountsByBlockKey.get(accountBindingKey) === userId,
  );
}

export function isProtectedAdminBlockKey(blockKey: string) {
  return protectedAdminBlockKeys.has(blockKey);
}

export function changeUserName(userId: string, requestedName: string): NameChangeResult {
  const validation = validateName(requestedName);
  if (!validation.ok) return { ok: false, error: validation.error, status: 400 };

  const existingProfile = profiles.get(userId);
  if (!existingProfile) return { ok: false, error: "请先完成账户登记", status: 404 };
  const profile = existingProfile;
  if (normalizeName(profile.name) === normalizeName(validation.name)) {
    return {
      ok: true,
      name: profile.name,
      nextNameChangeAt: profile.lastNameChangeAt ? profile.lastNameChangeAt + NAME_CHANGE_COOLDOWN_MS : 0,
    };
  }

  const owner = findNameOwner(validation.name);
  if (owner && owner.userId !== userId) {
    return { ok: false, error: "该名称已被使用", status: 409 };
  }

  const nextNameChangeAt = profile.lastNameChangeAt + NAME_CHANGE_COOLDOWN_MS;
  if (profile.lastNameChangeAt && Date.now() < nextNameChangeAt) {
    return {
      ok: false,
      error: "每 5 分钟最多修改一次名称",
      status: 429,
      retryAfterMs: nextNameChangeAt - Date.now(),
      nextNameChangeAt,
    };
  }

  profile.name = validation.name;
  profile.lastNameChangeAt = Date.now();
  const online = users.get(userId);
  if (online) users.set(userId, { ...online, name: profile.name });
  notify();
  return { ok: true, name: profile.name, nextNameChangeAt: profile.lastNameChangeAt + NAME_CHANGE_COOLDOWN_MS };
}

export function getRegisteredUserName(userId: string) {
  return profiles.get(userId)?.name;
}

export function removeOnlineUsersByBlockKey(blockKey: string) {
  let changed = false;
  users.forEach((user, userId) => {
    if (user.blockKey === blockKey) {
      users.delete(userId);
      changed = true;
    }
  });
  if (changed) notify();
  return changed;
}

export function subscribePresence(listener: () => void) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}
