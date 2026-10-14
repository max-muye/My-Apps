export type ChatMessage = {
  id: string;
  userId: string;
  name: string;
  text: string;
  createdAt: string;
  ipAddress: string;
};

export type ChatEvent =
  | { type: "message"; message: ChatMessage }
  | { type: "delete"; id: string }
  | { type: "clear" }
  | { type: "unban-request"; request: UnbanRequest };

export type BannedUser = {
  blockKey: string;
  name: string;
  bannedAt: string;
  reason: string;
};

export type UnbanRequest = {
  blockKey: string;
  name: string;
  requestedAt: string;
};

const messages: ChatMessage[] = [
  {
    id: "welcome",
    userId: "system",
    name: "同频",
    text: "欢迎来到大厅，和大家打个招呼吧。",
    createdAt: new Date().toISOString(),
    ipAddress: "system",
  },
];

const bannedUsers = new Map<string, BannedUser>();
const unbanRequests = new Map<string, UnbanRequest>();
const messageActivity = new Map<string, { recent: number[]; long: number[] }>();
const subscribers = new Set<(event: ChatEvent) => void>();

const FREQUENCY_WINDOW_MS = 10_000;
const FREQUENCY_LIMIT = 5;
const LONG_MESSAGE_MIN_LENGTH = 350;
const LONG_MESSAGE_WINDOW_MS = 2 * 60_000;
const LONG_MESSAGE_LIMIT = 3;

export function toPublicMessage(message: ChatMessage) {
  const { ipAddress: _ipAddress, ...publicMessage } = message;
  return publicMessage;
}

export function getMessages() {
  return messages.slice();
}

export function getPublicMessages() {
  return messages.map(toPublicMessage);
}

export function subscribe(listener: (event: ChatEvent) => void) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

function notify(event: ChatEvent) {
  subscribers.forEach((listener) => listener(event));
}

export function isIpBanned(ipAddress: string) {
  return bannedUsers.has(ipAddress);
}

export function getBannedUsers() {
  return [...bannedUsers.values()];
}

export function banIp(ipAddress: string, name: string, reason = "管理员封禁") {
  const previous = bannedUsers.get(ipAddress);
  bannedUsers.set(ipAddress, {
    blockKey: ipAddress,
    name: name || previous?.name || "未知访客",
    bannedAt: previous?.bannedAt || new Date().toISOString(),
    reason: previous?.reason || reason,
  });
}

export function unbanIp(ipAddress: string) {
  bannedUsers.delete(ipAddress);
  unbanRequests.delete(ipAddress);
  messageActivity.delete(ipAddress);
}

export function checkMessageAbuse(blockKey: string, text: string) {
  const now = Date.now();
  const activity = messageActivity.get(blockKey) || { recent: [], long: [] };
  activity.recent = activity.recent.filter((timestamp) => now - timestamp < FREQUENCY_WINDOW_MS);
  activity.long = activity.long.filter((timestamp) => now - timestamp < LONG_MESSAGE_WINDOW_MS);
  activity.recent.push(now);
  if (text.length >= LONG_MESSAGE_MIN_LENGTH) activity.long.push(now);
  messageActivity.set(blockKey, activity);

  if (activity.long.length >= LONG_MESSAGE_LIMIT) return "短时间内连续发送多条超长消息";
  if (activity.recent.length > FREQUENCY_LIMIT) return "消息发送频率远高于正常水平";
  return null;
}

export function hasUnbanRequest(ipAddress: string) {
  return unbanRequests.has(ipAddress);
}

export function getUnbanRequests() {
  return [...unbanRequests.values()];
}

export function requestUnban(ipAddress: string, name: string) {
  if (unbanRequests.has(ipAddress)) return null;
  const request: UnbanRequest = {
    blockKey: ipAddress,
    name: name || "未知访客",
    requestedAt: new Date().toISOString(),
  };
  unbanRequests.set(ipAddress, request);
  notify({ type: "unban-request", request });
  return request;
}

export function createMessage(userId: string, name: string, text: string, ipAddress: string) {
  const message: ChatMessage = {
    id: crypto.randomUUID(),
    userId,
    name,
    text,
    ipAddress,
    createdAt: new Date().toISOString(),
  };
  messages.push(message);
  if (messages.length > 100) messages.splice(0, messages.length - 100);
  notify({ type: "message", message });
  return message;
}

export function deleteMessage(id: string) {
  const index = messages.findIndex((message) => message.id === id);
  if (index === -1) return false;
  messages.splice(index, 1);
  notify({ type: "delete", id });
  return true;
}

export function clearMessages() {
  messages.splice(0, messages.length);
  notify({ type: "clear" });
}
