"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  userId: string;
  name: string;
  text: string;
  createdAt: string;
};

type AdminMessage = ChatMessage & { ipAddress: string };
type OnlineUser = { userId: string; name: string; blockKey?: string; isAdmin?: boolean };
type BannedUser = { blockKey: string; name: string; bannedAt: string; reason?: string };
type UnbanRequest = { blockKey: string; name: string; requestedAt: string };

const makeGuestName = () => `访客 ${Math.floor(100 + Math.random() * 900)}`;

async function hasPersistentBrowserStorage() {
  try {
    const key = "lan-chat-storage-check";
    window.localStorage.setItem(key, "ok");
    if (window.localStorage.getItem(key) !== "ok" || !window.indexedDB) return false;
    window.localStorage.removeItem(key);
    return await new Promise<boolean>((resolve) => {
      const request = window.indexedDB.open("lan-chat-storage-check", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("check");
      request.onsuccess = () => {
        request.result.close();
        resolve(true);
      };
      request.onerror = () => resolve(false);
      request.onblocked = () => resolve(false);
    });
  } catch {
    return false;
  }
}

function formatCooldown(milliseconds: number) {
  const seconds = Math.max(1, Math.ceil(milliseconds / 1000));
  if (seconds < 60) return `${seconds} 秒`;
  return `${Math.ceil(seconds / 60)} 分钟`;
}

function getInitials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "访";
}

function getAvatarTone(userId: string) {
  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) % 6;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function Home() {
  const [name, setName] = useState("访客");
  const [nameDraft, setNameDraft] = useState("访客");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");
  const [nextNameChangeAt, setNextNameChangeAt] = useState(0);
  const [storageReady, setStorageReady] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [accountToken, setAccountToken] = useState("");
  const [accountVerified, setAccountVerified] = useState(false);
  const [entryBlocked, setEntryBlocked] = useState("");
  const [showOnlineMenu, setShowOnlineMenu] = useState(false);
  const [showBlacklistMenu, setShowBlacklistMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [isBanned, setIsBanned] = useState(false);
  const [hasRequestedUnban, setHasRequestedUnban] = useState(false);
  const [unbanNotices, setUnbanNotices] = useState<UnbanRequest[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [userId, setUserId] = useState("user-pending");
  const listRef = useRef<HTMLDivElement>(null);
  const seenUnbanRequests = useRef(new Set<string>());

  const initials = useMemo(() => getInitials(name), [name]);

  const showUnbanNotice = (notice: UnbanRequest) => {
    const noticeId = `${notice.blockKey}:${notice.requestedAt}`;
    const remaining = 20_000 - (Date.now() - new Date(notice.requestedAt).getTime());
    if (remaining <= 0 || seenUnbanRequests.current.has(noticeId)) return;
    seenUnbanRequests.current.add(noticeId);
    setUnbanNotices((current) => [...current.filter((item) => item.blockKey !== notice.blockKey), notice]);
    window.setTimeout(() => {
      setUnbanNotices((current) => current.filter((item) => item.blockKey !== notice.blockKey));
    }, remaining);
  };

  useEffect(() => {
    setIsAdmin(["localhost", "127.0.0.1", "::1"].includes(window.location.hostname));
    let stream: EventSource | null = null;
    let disposed = false;

    const start = async () => {
      if (!(await hasPersistentBrowserStorage())) {
        if (!disposed) setStorageBlocked(true);
        return;
      }
      if (disposed) return;
      setStorageReady(true);
      const savedUserId = window.localStorage.getItem("lan-chat-user-id") || `user-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem("lan-chat-user-id", savedUserId);
      setUserId(savedUserId);
      setAccountToken(window.localStorage.getItem("lan-chat-account-token") || "");

      const savedName = window.localStorage.getItem("lan-chat-name") || makeGuestName();
      setName(savedName);
      setNameDraft(savedName);

      fetch("/api/messages")
        .then((response) => response.json())
        .then((data: { messages?: ChatMessage[] }) => setMessages(data.messages || []))
        .catch(() => setConnected(false))
        .finally(() => setMessagesLoading(false));

      stream = new EventSource("/api/stream");
      stream.onopen = () => setConnected(true);
      stream.onmessage = (event) => {
        const incoming = JSON.parse(event.data) as ChatMessage;
        setMessages((current) =>
          current.some((message) => message.id === incoming.id) ? current : [...current, incoming],
        );
      };
      stream.addEventListener("delete", (event) => {
        const deleted = JSON.parse((event as MessageEvent).data) as { id: string };
        setMessages((current) => current.filter((message) => message.id !== deleted.id));
      });
      stream.addEventListener("clear", () => setMessages([]));
      stream.addEventListener("presence", (event) => {
        const update = JSON.parse((event as MessageEvent).data) as { users?: OnlineUser[] };
        setOnlineUsers(update.users || []);
      });
      stream.addEventListener("unban-request", (event) => {
        const request = JSON.parse((event as MessageEvent).data) as { request: UnbanRequest };
        showUnbanNotice(request.request);
      });
      stream.onerror = () => setConnected(false);
    };

    void start();
    return () => {
      disposed = true;
      stream?.close();
    };
  }, []);

  useEffect(() => {
    if (!storageReady || userId === "user-pending") return;
    let active = true;
    const announcePresence = () => {
      fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name, accountToken }),
      })
        .then(async (response) => ({ response, data: await response.json() as {
          error?: string;
          code?: string;
          users?: OnlineUser[];
          currentName?: string;
          accountToken?: string;
          nextNameChangeAt?: number;
          isBanned?: boolean;
          hasRequestedUnban?: boolean;
        } }))
        .then(({ response, data }) => {
          if (!active) return;
          if (!response.ok) {
            setAccountVerified(false);
            if (response.status === 403) {
              setEntryBlocked(data.error || "此 IP 已绑定其他账户");
              return;
            }
            if (response.status === 409) {
              setNameError(data.error || "该名称已被使用");
              setShowNameEditor(true);
            }
            return;
          }
          setEntryBlocked("");
          setAccountVerified(true);
          setOnlineUsers(data.users || []);
          setIsBanned(Boolean(data.isBanned));
          setHasRequestedUnban(Boolean(data.hasRequestedUnban));
          setNextNameChangeAt(data.nextNameChangeAt || 0);
          if (data.accountToken && data.accountToken !== accountToken) {
            setAccountToken(data.accountToken);
            window.localStorage.setItem("lan-chat-account-token", data.accountToken);
          }
          if (data.currentName && data.currentName !== name) {
            setName(data.currentName);
            setNameDraft(data.currentName);
            window.localStorage.setItem("lan-chat-name", data.currentName);
          }
        })
        .catch(() => undefined);
    };

    announcePresence();
    const timer = window.setInterval(announcePresence, 15_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [accountToken, name, storageReady, userId]);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    const refreshAdminState = () => {
      fetch("/api/admin/messages")
        .then((response) => response.json())
        .then((data: { bannedUsers?: BannedUser[]; unbanRequests?: UnbanRequest[] }) => {
          if (!active) return;
          setBannedUsers(data.bannedUsers || []);
          (data.unbanRequests || []).forEach(showUnbanNotice);
        })
        .catch(() => undefined);
    };
    refreshAdminState();
    const timer = window.setInterval(refreshAdminState, 2_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [isAdmin]);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  const saveName = async () => {
    const nextName = nameDraft.trim().slice(0, 20);
    if (!nextName || savingName) return;
    if (nextNameChangeAt > Date.now() && nextName.toLocaleLowerCase("zh-CN") !== name.toLocaleLowerCase("zh-CN")) {
      setNameError(`每 5 分钟最多修改一次，还需等待 ${formatCooldown(nextNameChangeAt - Date.now())}`);
      return;
    }

    setSavingName(true);
    setNameError("");
    try {
      const response = await fetch(accountVerified ? "/api/profile/name" : "/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name: nextName, accountToken }),
      });
      const data = (await response.json()) as {
        error?: string;
        code?: string;
        name?: string;
        currentName?: string;
        accountToken?: string;
        nextNameChangeAt?: number;
      };
      if (!response.ok) {
        if (response.status === 403 && data.code?.includes("ACCOUNT")) {
          setEntryBlocked(data.error || "此 IP 已绑定其他账户");
          setShowNameEditor(false);
        } else if (response.status === 403) {
          setIsBanned(true);
        }
        setNameError(data.error || "名称修改失败");
        if (data.nextNameChangeAt) setNextNameChangeAt(data.nextNameChangeAt);
        return;
      }
      const savedName = data.name || data.currentName || nextName;
      setName(savedName);
      setNameDraft(savedName);
      setNextNameChangeAt(data.nextNameChangeAt || 0);
      window.localStorage.setItem("lan-chat-name", savedName);
      if (data.accountToken) {
        setAccountToken(data.accountToken);
        window.localStorage.setItem("lan-chat-account-token", data.accountToken);
      }
      setAccountVerified(true);
      setShowNameEditor(false);
    } catch {
      setNameError("名称修改失败，请确认聊天室服务仍在运行");
    } finally {
      setSavingName(false);
    }
  };

  const openAdmin = async () => {
    setShowAdmin(true);
    setAdminLoading(true);
    try {
      const response = await fetch("/api/admin/messages");
      if (!response.ok) throw new Error("admin unavailable");
      const data = (await response.json()) as { messages: AdminMessage[]; bannedUsers: BannedUser[]; unbanRequests: UnbanRequest[] };
      setAdminMessages(data.messages || []);
      setBannedUsers(data.bannedUsers || []);
      (data.unbanRequests || []).forEach(showUnbanNotice);
    } catch {
      setShowAdmin(false);
      window.alert("管理员接口不可用，请确认你是通过 localhost:3000 打开的。");
    } finally {
      setAdminLoading(false);
    }
  };

  const deleteAdminMessage = async (id: string) => {
    const response = await fetch(`/api/admin/messages?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) return;
    setAdminMessages((current) => current.filter((message) => message.id !== id));
    setMessages((current) => current.filter((message) => message.id !== id));
  };

  const clearAllMessages = async () => {
    if (!window.confirm("确定清空全部消息吗？此操作不可恢复。")) return;
    const response = await fetch("/api/admin/messages?all=true", { method: "DELETE" });
    if (!response.ok) return;
    setAdminMessages([]);
    setMessages([]);
  };

  const toggleBan = async (ipAddress: string, name = "未知访客") => {
    const isBanned = bannedUsers.some((user) => user.blockKey === ipAddress);
    const response = await fetch(isBanned ? `/api/admin/ban?ip=${encodeURIComponent(ipAddress)}` : "/api/admin/ban", {
      method: isBanned ? "DELETE" : "POST",
      headers: isBanned ? undefined : { "Content-Type": "application/json" },
      body: isBanned ? undefined : JSON.stringify({ ipAddress, name }),
    });
    if (!response.ok) return;
    const data = (await response.json()) as { bannedUsers: BannedUser[] };
    setBannedUsers(data.bannedUsers || []);
  };

  const requestUnban = async () => {
    if (hasRequestedUnban) return;
    const response = await fetch("/api/unban-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, accountToken }),
    });
    if (response.ok || response.status === 409) setHasRequestedUnban(true);
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending || isBanned || !accountVerified) return;

    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, accountToken, text }),
      });
      if (response.status === 403) {
        const data = (await response.json().catch(() => null)) as { code?: string; error?: string; reason?: string } | null;
        if (data?.code?.includes("ACCOUNT")) {
          setAccountVerified(false);
          setEntryBlocked(data.error || "账户凭证无效");
          return;
        }
        setIsBanned(true);
        if (data?.reason) window.alert(`系统已自动封禁：${data.reason}`);
        return;
      }
      if (!response.ok) throw new Error("send failed");
      const message = (await response.json()) as ChatMessage;
      setMessages((current) =>
        current.some((item) => item.id === message.id) ? current : [...current, message],
      );
      setDraft("");
    } catch {
      window.alert("消息发送失败，请确认聊天室服务仍在运行。");
    } finally {
      setSending(false);
    }
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <main className="chat-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">↗</span>
          <span>同频</span>
        </div>

        <div className="workspace-label">我的空间</div>
        <button className="room active" type="button">
          <span className="room-icon">#</span>
          <span className="room-copy">
            <strong>大厅</strong>
            <small>随时聊两句</small>
          </span>
          <span className="room-dot" />
        </button>

        <div className="sidebar-note">
          <span className="note-icon">✦</span>
          <p>这是一个轻量的局域网聊天室。把地址分享给同一网络下的朋友，就可以一起聊天。</p>
        </div>

        <div className="sidebar-footer">
          <span className={`status-light ${connected ? "online" : "offline"}`} />
          <span>{connected ? "服务已连接" : "正在连接…"}</span>
        </div>
      </aside>

      <section className="chat-panel">
        <header className="chat-header">
          <div>
            <div className="eyebrow">公共频道</div>
            <h1>大厅</h1>
            <p>和在场的人说点什么</p>
          </div>
          <div className="header-actions">
            <div className="online-menu-wrap">
              <button className="online-menu-button" type="button" onClick={() => {
                setShowOnlineMenu((current) => !current);
                setShowBlacklistMenu(false);
              }} aria-expanded={showOnlineMenu} aria-controls="online-menu">
                <span className="online-menu-dot" />
                <span>在线 {onlineUsers.length} 人</span>
                <span className="chevron">⌄</span>
              </button>
              {showOnlineMenu && (
                <div className="online-menu" id="online-menu" role="menu">
                  <div className="online-menu-header">
                    <strong>在线列表</strong>
                    <span>可查看名称</span>
                  </div>
                  {onlineUsers.length === 0 ? (
                    <div className="online-menu-empty">暂时没有在线用户</div>
                  ) : (
                    <div className="online-menu-list">
                      {onlineUsers.map((user) => {
                        const blockKey = user.blockKey || `visitor:${user.userId}`;
                        const isBanned = bannedUsers.some((bannedUser) => bannedUser.blockKey === blockKey);
                        return (
                          <div className="online-menu-user" key={user.userId} role="menuitem">
                            <span className={`online-avatar avatar tone-${getAvatarTone(user.userId)}`}>{getInitials(user.name)}</span>
                            <span className="online-menu-name">{user.name}{user.userId === userId ? <small>你</small> : null}</span>
                            <span className="online-dot" />
                            {isAdmin && !user.isAdmin && user.userId !== userId && (
                              <button className="online-ban-button" type="button" onClick={() => toggleBan(blockKey, user.name)}>{isBanned ? "解封" : "封禁"}</button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            {isAdmin && (
              <div className="online-menu-wrap">
                <button className="online-menu-button blacklist-menu-button" type="button" onClick={() => {
                  setShowBlacklistMenu((current) => !current);
                  setShowOnlineMenu(false);
                }} aria-expanded={showBlacklistMenu} aria-controls="blacklist-menu">
                  <span className="blacklist-menu-dot">×</span>
                  <span>黑名单 {bannedUsers.length}</span>
                  <span className="chevron">⌄</span>
                </button>
                {showBlacklistMenu && (
                  <div className="online-menu blacklist-menu" id="blacklist-menu" role="menu">
                    <div className="online-menu-header">
                      <strong>黑名单</strong>
                      <span>随时可以解封</span>
                    </div>
                    {bannedUsers.length === 0 ? (
                      <div className="online-menu-empty">暂无封禁记录</div>
                    ) : (
                      <div className="online-menu-list">
                        {bannedUsers.map((bannedUser) => (
                          <div className="blacklist-menu-user" key={bannedUser.blockKey} role="menuitem">
                            <span className="blacklist-menu-value" title={bannedUser.reason}>{bannedUser.name}</span>
                            <button type="button" onClick={() => toggleBan(bannedUser.blockKey, bannedUser.name)}>解封</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {isAdmin && (
              <button className="message-admin-button" type="button" onClick={() => {
                setShowOnlineMenu(false);
                setShowBlacklistMenu(false);
                openAdmin();
              }}>
                消息管理
              </button>
            )}
            <button className="profile-button" type="button" disabled={isBanned || !accountVerified} onClick={() => {
              setNameDraft(name);
              setNameError("");
              setShowNameEditor(true);
            }}>
              <span className={`avatar small-avatar tone-${getAvatarTone(userId)}`}>{initials}</span>
              <span className="profile-name">{name}</span>
              <span className="chevron">⌄</span>
            </button>
          </div>
        </header>

        <div className="message-list" ref={listRef} aria-live="polite">
          {messagesLoading ? (
            <div className="loading-state">正在加载消息…</div>
          ) : messages.length === 0 ? (
            <div className="empty-state">还没有消息，开始聊天吧。</div>
          ) : (
            messages.map((message) => (
              <article className={`message-row ${message.userId === userId ? "mine" : ""}`} key={message.id}>
                <span className={`avatar tone-${getAvatarTone(message.userId)}`}>{getInitials(message.name)}</span>
                <div className="message-content">
                  <div className="message-meta">
                    <strong>{message.userId === userId ? "你" : message.name}</strong>
                    <time>{formatTime(message.createdAt)}</time>
                  </div>
                  <p>{message.text}</p>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="composer-wrap">
          {isBanned ? (
            <div className="ban-notice">
              <div>
                <strong>你已被管理员封禁</strong>
                <span>请联系管理员解封。</span>
              </div>
              <button className="unban-request-button" type="button" onClick={requestUnban} disabled={hasRequestedUnban}>
                {hasRequestedUnban ? "已申请解封" : "申请解封"}
              </button>
            </div>
          ) : (
          <form className="composer" onSubmit={sendMessage}>
            <textarea
              aria-label="输入消息"
              value={draft}
              maxLength={2000}
              disabled={!accountVerified}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder={accountVerified ? "写下你的消息…" : "正在验证账户…"}
              rows={1}
            />
            <div className="composer-actions">
              <span className="composer-hint">Enter 发送 · Shift + Enter 换行</span>
              <button className="send-button" type="submit" disabled={!draft.trim() || sending || !accountVerified} aria-label="发送消息">
                {sending ? "…" : "发送"}
              </button>
            </div>
          </form>
          )}
          <div className="composer-footer">
            <span>最多 2000 个字符</span>
            <span>{draft.length}/2000</span>
          </div>
        </div>
      </section>

      {showNameEditor && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowNameEditor(false)}>
          <div className="name-modal" role="dialog" aria-modal="true" aria-labelledby="name-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-icon">✦</div>
            <h2 id="name-title">换个名字</h2>
            <p>这个名字会显示在你发出的消息旁边。</p>
            <input
              autoFocus
              aria-label="你的名字"
              value={nameDraft}
              maxLength={20}
              onChange={(event) => {
                const nextName = event.target.value;
                if (!nextName.trim()) {
                  setNameDraft(name);
                  setNameError("名称不能为空，已恢复为当前名称");
                  return;
                }
                setNameDraft(nextName);
                setNameError("");
              }}
              onKeyDown={(event) => event.key === "Enter" && void saveName()}
            />
            <div className="name-rules">名称不能重复 · 每 5 分钟最多修改一次</div>
            {nameError && <div className="name-error" role="alert">{nameError}</div>}
            <div className="modal-actions">
              <button className="cancel-button" type="button" onClick={() => setShowNameEditor(false)}>取消</button>
              <button className="save-button" type="button" disabled={savingName || !nameDraft.trim()} onClick={() => void saveName()}>{savingName ? "保存中…" : "保存"}</button>
            </div>
          </div>
        </div>
      )}

      {showAdmin && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowAdmin(false)}>
          <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <div className="eyebrow">仅限本机</div>
                <h2 id="admin-title">管理员控制台</h2>
              </div>
              <button className="close-button" type="button" onClick={() => setShowAdmin(false)} aria-label="关闭管理面板">×</button>
            </div>
            <div className="admin-toolbar">
              <span>{adminMessages.length} 条消息</span>
              <button className="clear-button" type="button" onClick={clearAllMessages} disabled={!adminMessages.length}>清空消息</button>
            </div>
            {adminLoading ? (
              <div className="admin-empty">正在读取管理数据…</div>
            ) : adminMessages.length === 0 ? (
              <div className="admin-empty">当前没有消息。</div>
            ) : (
              <div className="admin-message-list">
                {adminMessages.map((message) => (
                    <div className="admin-message" key={message.id}>
                      <div className="admin-message-main">
                        <div className="admin-message-meta"><strong>{message.name}</strong><span>{message.ipAddress}</span></div>
                        <p>{message.text}</p>
                      </div>
                      {message.ipAddress !== "system" && (
                        <div className="admin-message-actions">
                          <button type="button" onClick={() => deleteAdminMessage(message.id)}>删除</button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isAdmin && unbanNotices.length > 0 && (
        <div className="unban-notices" aria-live="polite">
          {unbanNotices.map((notice) => (
            <div className="unban-notice" key={notice.blockKey}>
              <span className="unban-notice-mark">!</span>
              <span><strong>{notice.name}</strong> 想申请解封</span>
            </div>
          ))}
        </div>
      )}

      {storageBlocked && (
        <div className="storage-gate" role="alertdialog" aria-modal="true" aria-labelledby="storage-gate-title">
          <div className="storage-gate-card">
            <span>隐私模式不可用</span>
            <h2 id="storage-gate-title">请退出无痕/隐私浏览</h2>
            <p>聊天室需要浏览器持久保存访客身份。请使用普通窗口打开此页面，然后刷新重试。</p>
            <button type="button" onClick={() => window.location.reload()}>刷新重试</button>
          </div>
        </div>
      )}

      {entryBlocked && !storageBlocked && (
        <div className="storage-gate" role="alertdialog" aria-modal="true" aria-labelledby="account-gate-title">
          <div className="storage-gate-card">
            <span>无法进入聊天室</span>
            <h2 id="account-gate-title">此 IP 已有账户</h2>
            <p>{entryBlocked}。无痕窗口和新的浏览器账户不能再次登记。</p>
            <button type="button" onClick={() => window.location.reload()}>使用原浏览器后重试</button>
          </div>
        </div>
      )}
    </main>
  );
}
