import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/app/page.tsx");const useEffect = __vite__cjsImport0_react["useEffect"]; const useMemo = __vite__cjsImport0_react["useMemo"]; const useRef = __vite__cjsImport0_react["useRef"]; const useState = __vite__cjsImport0_react["useState"];const _jsxDEV = __vite__cjsImport1_react_jsxDevRuntime["jsxDEV"];"use client";
import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=2a9297f8";
var _jsxFileName = "/Users/jerry/Documents/Codex/2026-08-10/ni-b/app/page.tsx";
import __vite__cjsImport1_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=2a9297f8";
var _s = $RefreshSig$();
const makeGuestName = () => `访客 ${Math.floor(100 + Math.random() * 900)}`;
async function hasPersistentBrowserStorage() {
	try {
		const key = "lan-chat-storage-check";
		window.localStorage.setItem(key, "ok");
		if (window.localStorage.getItem(key) !== "ok" || !window.indexedDB) return false;
		window.localStorage.removeItem(key);
		return await new Promise((resolve) => {
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
function formatCooldown(milliseconds) {
	const seconds = Math.max(1, Math.ceil(milliseconds / 1e3));
	if (seconds < 60) return `${seconds} 秒`;
	return `${Math.ceil(seconds / 60)} 分钟`;
}
function getInitials(name) {
	return name.trim().slice(0, 1).toUpperCase() || "访";
}
function getAvatarTone(userId) {
	let hash = 0;
	for (let index = 0; index < userId.length; index += 1) {
		hash = hash * 31 + userId.charCodeAt(index) | 0;
	}
	return Math.abs(hash) % 6;
}
function formatTime(value) {
	return new Intl.DateTimeFormat("zh-CN", {
		hour: "2-digit",
		minute: "2-digit"
	}).format(new Date(value));
}
export default function Home() {
	_s();
	const [name, setName] = useState("访客");
	const [nameDraft, setNameDraft] = useState("访客");
	const [messages, setMessages] = useState([]);
	const [onlineUsers, setOnlineUsers] = useState([]);
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
	const [adminMessages, setAdminMessages] = useState([]);
	const [bannedUsers, setBannedUsers] = useState([]);
	const [isBanned, setIsBanned] = useState(false);
	const [hasRequestedUnban, setHasRequestedUnban] = useState(false);
	const [unbanNotices, setUnbanNotices] = useState([]);
	const [adminLoading, setAdminLoading] = useState(false);
	const [userId, setUserId] = useState("user-pending");
	const listRef = useRef(null);
	const seenUnbanRequests = useRef(new Set());
	const initials = useMemo(() => getInitials(name), [name]);
	const showUnbanNotice = (notice) => {
		const noticeId = `${notice.blockKey}:${notice.requestedAt}`;
		const remaining = 2e4 - (Date.now() - new Date(notice.requestedAt).getTime());
		if (remaining <= 0 || seenUnbanRequests.current.has(noticeId)) return;
		seenUnbanRequests.current.add(noticeId);
		setUnbanNotices((current) => [...current.filter((item) => item.blockKey !== notice.blockKey), notice]);
		window.setTimeout(() => {
			setUnbanNotices((current) => current.filter((item) => item.blockKey !== notice.blockKey));
		}, remaining);
	};
	useEffect(() => {
		setIsAdmin([
			"localhost",
			"127.0.0.1",
			"::1"
		].includes(window.location.hostname));
		let stream = null;
		let disposed = false;
		const start = async () => {
			if (!await hasPersistentBrowserStorage()) {
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
			fetch("/api/messages").then((response) => response.json()).then((data) => setMessages(data.messages || [])).catch(() => setConnected(false)).finally(() => setMessagesLoading(false));
			stream = new EventSource("/api/stream");
			stream.onopen = () => setConnected(true);
			stream.onmessage = (event) => {
				const incoming = JSON.parse(event.data);
				setMessages((current) => current.some((message) => message.id === incoming.id) ? current : [...current, incoming]);
			};
			stream.addEventListener("delete", (event) => {
				const deleted = JSON.parse(event.data);
				setMessages((current) => current.filter((message) => message.id !== deleted.id));
			});
			stream.addEventListener("clear", () => setMessages([]));
			stream.addEventListener("presence", (event) => {
				const update = JSON.parse(event.data);
				setOnlineUsers(update.users || []);
			});
			stream.addEventListener("unban-request", (event) => {
				const request = JSON.parse(event.data);
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
				body: JSON.stringify({
					userId,
					name,
					accountToken
				})
			}).then(async (response) => ({
				response,
				data: await response.json()
			})).then(({ response, data }) => {
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
			}).catch(() => undefined);
		};
		announcePresence();
		const timer = window.setInterval(announcePresence, 15e3);
		return () => {
			active = false;
			window.clearInterval(timer);
		};
	}, [
		accountToken,
		name,
		storageReady,
		userId
	]);
	useEffect(() => {
		if (!isAdmin) return;
		let active = true;
		const refreshAdminState = () => {
			fetch("/api/admin/messages").then((response) => response.json()).then((data) => {
				if (!active) return;
				setBannedUsers(data.bannedUsers || []);
				(data.unbanRequests || []).forEach(showUnbanNotice);
			}).catch(() => undefined);
		};
		refreshAdminState();
		const timer = window.setInterval(refreshAdminState, 2e3);
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
				body: JSON.stringify({
					userId,
					name: nextName,
					accountToken
				})
			});
			const data = await response.json();
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
			const data = await response.json();
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
	const deleteAdminMessage = async (id) => {
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
	const toggleBan = async (ipAddress, name = "未知访客") => {
		const isBanned = bannedUsers.some((user) => user.blockKey === ipAddress);
		const response = await fetch(isBanned ? `/api/admin/ban?ip=${encodeURIComponent(ipAddress)}` : "/api/admin/ban", {
			method: isBanned ? "DELETE" : "POST",
			headers: isBanned ? undefined : { "Content-Type": "application/json" },
			body: isBanned ? undefined : JSON.stringify({
				ipAddress,
				name
			})
		});
		if (!response.ok) return;
		const data = await response.json();
		setBannedUsers(data.bannedUsers || []);
	};
	const requestUnban = async () => {
		if (hasRequestedUnban) return;
		const response = await fetch("/api/unban-request", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				userId,
				accountToken
			})
		});
		if (response.ok || response.status === 409) setHasRequestedUnban(true);
	};
	const sendMessage = async (event) => {
		event.preventDefault();
		const text = draft.trim();
		if (!text || sending || isBanned || !accountVerified) return;
		setSending(true);
		try {
			const response = await fetch("/api/messages", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId,
					accountToken,
					text
				})
			});
			if (response.status === 403) {
				const data = await response.json().catch(() => null);
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
			const message = await response.json();
			setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
			setDraft("");
		} catch {
			window.alert("消息发送失败，请确认聊天室服务仍在运行。");
		} finally {
			setSending(false);
		}
	};
	const handleComposerKeyDown = (event) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			event.currentTarget.form?.requestSubmit();
		}
	};
	return /* @__PURE__ */ _jsxDEV("main", {
		className: "chat-shell",
		children: [
			/* @__PURE__ */ _jsxDEV("aside", {
				className: "sidebar",
				children: [
					/* @__PURE__ */ _jsxDEV("div", {
						className: "brand",
						children: [/* @__PURE__ */ _jsxDEV("span", {
							className: "brand-mark",
							children: "↗"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 410,
							columnNumber: 11
						}, this), /* @__PURE__ */ _jsxDEV("span", { children: "同频" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 411,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 409,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ _jsxDEV("div", {
						className: "workspace-label",
						children: "我的空间"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 414,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ _jsxDEV("button", {
						className: "room active",
						type: "button",
						children: [
							/* @__PURE__ */ _jsxDEV("span", {
								className: "room-icon",
								children: "#"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 416,
								columnNumber: 11
							}, this),
							/* @__PURE__ */ _jsxDEV("span", {
								className: "room-copy",
								children: [/* @__PURE__ */ _jsxDEV("strong", { children: "大厅" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 418,
									columnNumber: 13
								}, this), /* @__PURE__ */ _jsxDEV("small", { children: "随时聊两句" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 419,
									columnNumber: 13
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 417,
								columnNumber: 11
							}, this),
							/* @__PURE__ */ _jsxDEV("span", { className: "room-dot" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 421,
								columnNumber: 11
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 415,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ _jsxDEV("div", {
						className: "sidebar-note",
						children: [/* @__PURE__ */ _jsxDEV("span", {
							className: "note-icon",
							children: "✦"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 425,
							columnNumber: 11
						}, this), /* @__PURE__ */ _jsxDEV("p", { children: "这是一个轻量的局域网聊天室。把地址分享给同一网络下的朋友，就可以一起聊天。" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 426,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 424,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ _jsxDEV("div", {
						className: "sidebar-footer",
						children: [/* @__PURE__ */ _jsxDEV("span", { className: `status-light ${connected ? "online" : "offline"}` }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 430,
							columnNumber: 11
						}, this), /* @__PURE__ */ _jsxDEV("span", { children: connected ? "服务已连接" : "正在连接…" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 431,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 429,
						columnNumber: 9
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 408,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ _jsxDEV("section", {
				className: "chat-panel",
				children: [
					/* @__PURE__ */ _jsxDEV("header", {
						className: "chat-header",
						children: [/* @__PURE__ */ _jsxDEV("div", { children: [
							/* @__PURE__ */ _jsxDEV("div", {
								className: "eyebrow",
								children: "公共频道"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 438,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ _jsxDEV("h1", { children: "大厅" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 439,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ _jsxDEV("p", { children: "和在场的人说点什么" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 440,
								columnNumber: 13
							}, this)
						] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 437,
							columnNumber: 11
						}, this), /* @__PURE__ */ _jsxDEV("div", {
							className: "header-actions",
							children: [
								/* @__PURE__ */ _jsxDEV("div", {
									className: "online-menu-wrap",
									children: [/* @__PURE__ */ _jsxDEV("button", {
										className: "online-menu-button",
										type: "button",
										onClick: () => {
											setShowOnlineMenu((current) => !current);
											setShowBlacklistMenu(false);
										},
										"aria-expanded": showOnlineMenu,
										"aria-controls": "online-menu",
										children: [
											/* @__PURE__ */ _jsxDEV("span", { className: "online-menu-dot" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 448,
												columnNumber: 17
											}, this),
											/* @__PURE__ */ _jsxDEV("span", { children: [
												"在线 ",
												onlineUsers.length,
												" 人"
											] }, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 449,
												columnNumber: 17
											}, this),
											/* @__PURE__ */ _jsxDEV("span", {
												className: "chevron",
												children: "⌄"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 450,
												columnNumber: 17
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 444,
										columnNumber: 15
									}, this), showOnlineMenu && /* @__PURE__ */ _jsxDEV("div", {
										className: "online-menu",
										id: "online-menu",
										role: "menu",
										children: [/* @__PURE__ */ _jsxDEV("div", {
											className: "online-menu-header",
											children: [/* @__PURE__ */ _jsxDEV("strong", { children: "在线列表" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 455,
												columnNumber: 21
											}, this), /* @__PURE__ */ _jsxDEV("span", { children: "可查看名称" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 456,
												columnNumber: 21
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 454,
											columnNumber: 19
										}, this), onlineUsers.length === 0 ? /* @__PURE__ */ _jsxDEV("div", {
											className: "online-menu-empty",
											children: "暂时没有在线用户"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 459,
											columnNumber: 21
										}, this) : /* @__PURE__ */ _jsxDEV("div", {
											className: "online-menu-list",
											children: onlineUsers.map((user) => {
												const blockKey = user.blockKey || `visitor:${user.userId}`;
												const isBanned = bannedUsers.some((bannedUser) => bannedUser.blockKey === blockKey);
												return /* @__PURE__ */ _jsxDEV("div", {
													className: "online-menu-user",
													role: "menuitem",
													children: [
														/* @__PURE__ */ _jsxDEV("span", {
															className: `online-avatar avatar tone-${getAvatarTone(user.userId)}`,
															children: getInitials(user.name)
														}, void 0, false, {
															fileName: _jsxFileName,
															lineNumber: 467,
															columnNumber: 29
														}, this),
														/* @__PURE__ */ _jsxDEV("span", {
															className: "online-menu-name",
															children: [user.name, user.userId === userId ? /* @__PURE__ */ _jsxDEV("small", { children: "你" }, void 0, false, {
																fileName: _jsxFileName,
																lineNumber: 468,
																columnNumber: 101
															}, this) : null]
														}, void 0, true, {
															fileName: _jsxFileName,
															lineNumber: 468,
															columnNumber: 29
														}, this),
														/* @__PURE__ */ _jsxDEV("span", { className: "online-dot" }, void 0, false, {
															fileName: _jsxFileName,
															lineNumber: 469,
															columnNumber: 29
														}, this),
														isAdmin && !user.isAdmin && user.userId !== userId && /* @__PURE__ */ _jsxDEV("button", {
															className: "online-ban-button",
															type: "button",
															onClick: () => toggleBan(blockKey, user.name),
															children: isBanned ? "解封" : "封禁"
														}, void 0, false, {
															fileName: _jsxFileName,
															lineNumber: 471,
															columnNumber: 31
														}, this)
													]
												}, user.userId, true, {
													fileName: _jsxFileName,
													lineNumber: 466,
													columnNumber: 27
												}, this);
											})
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 461,
											columnNumber: 21
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 453,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 443,
									columnNumber: 13
								}, this),
								isAdmin && /* @__PURE__ */ _jsxDEV("div", {
									className: "online-menu-wrap",
									children: [/* @__PURE__ */ _jsxDEV("button", {
										className: "online-menu-button blacklist-menu-button",
										type: "button",
										onClick: () => {
											setShowBlacklistMenu((current) => !current);
											setShowOnlineMenu(false);
										},
										"aria-expanded": showBlacklistMenu,
										"aria-controls": "blacklist-menu",
										children: [
											/* @__PURE__ */ _jsxDEV("span", {
												className: "blacklist-menu-dot",
												children: "×"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 487,
												columnNumber: 19
											}, this),
											/* @__PURE__ */ _jsxDEV("span", { children: ["黑名单 ", bannedUsers.length] }, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 488,
												columnNumber: 19
											}, this),
											/* @__PURE__ */ _jsxDEV("span", {
												className: "chevron",
												children: "⌄"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 489,
												columnNumber: 19
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 483,
										columnNumber: 17
									}, this), showBlacklistMenu && /* @__PURE__ */ _jsxDEV("div", {
										className: "online-menu blacklist-menu",
										id: "blacklist-menu",
										role: "menu",
										children: [/* @__PURE__ */ _jsxDEV("div", {
											className: "online-menu-header",
											children: [/* @__PURE__ */ _jsxDEV("strong", { children: "黑名单" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 494,
												columnNumber: 23
											}, this), /* @__PURE__ */ _jsxDEV("span", { children: "随时可以解封" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 495,
												columnNumber: 23
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 493,
											columnNumber: 21
										}, this), bannedUsers.length === 0 ? /* @__PURE__ */ _jsxDEV("div", {
											className: "online-menu-empty",
											children: "暂无封禁记录"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 498,
											columnNumber: 23
										}, this) : /* @__PURE__ */ _jsxDEV("div", {
											className: "online-menu-list",
											children: bannedUsers.map((bannedUser) => /* @__PURE__ */ _jsxDEV("div", {
												className: "blacklist-menu-user",
												role: "menuitem",
												children: [/* @__PURE__ */ _jsxDEV("span", {
													className: "blacklist-menu-value",
													title: bannedUser.reason,
													children: bannedUser.name
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 503,
													columnNumber: 29
												}, this), /* @__PURE__ */ _jsxDEV("button", {
													type: "button",
													onClick: () => toggleBan(bannedUser.blockKey, bannedUser.name),
													children: "解封"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 504,
													columnNumber: 29
												}, this)]
											}, bannedUser.blockKey, true, {
												fileName: _jsxFileName,
												lineNumber: 502,
												columnNumber: 27
											}, this))
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 500,
											columnNumber: 23
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 492,
										columnNumber: 19
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 482,
									columnNumber: 15
								}, this),
								isAdmin && /* @__PURE__ */ _jsxDEV("button", {
									className: "message-admin-button",
									type: "button",
									onClick: () => {
										setShowOnlineMenu(false);
										setShowBlacklistMenu(false);
										openAdmin();
									},
									children: "消息管理"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 514,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("button", {
									className: "profile-button",
									type: "button",
									disabled: isBanned || !accountVerified,
									onClick: () => {
										setNameDraft(name);
										setNameError("");
										setShowNameEditor(true);
									},
									children: [
										/* @__PURE__ */ _jsxDEV("span", {
											className: `avatar small-avatar tone-${getAvatarTone(userId)}`,
											children: initials
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 527,
											columnNumber: 15
										}, this),
										/* @__PURE__ */ _jsxDEV("span", {
											className: "profile-name",
											children: name
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 528,
											columnNumber: 15
										}, this),
										/* @__PURE__ */ _jsxDEV("span", {
											className: "chevron",
											children: "⌄"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 529,
											columnNumber: 15
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 522,
									columnNumber: 13
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 442,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 436,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ _jsxDEV("div", {
						className: "message-list",
						ref: listRef,
						"aria-live": "polite",
						children: messagesLoading ? /* @__PURE__ */ _jsxDEV("div", {
							className: "loading-state",
							children: "正在加载消息…"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 536,
							columnNumber: 13
						}, this) : messages.length === 0 ? /* @__PURE__ */ _jsxDEV("div", {
							className: "empty-state",
							children: "还没有消息，开始聊天吧。"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 538,
							columnNumber: 13
						}, this) : messages.map((message) => /* @__PURE__ */ _jsxDEV("article", {
							className: `message-row ${message.userId === userId ? "mine" : ""}`,
							children: [/* @__PURE__ */ _jsxDEV("span", {
								className: `avatar tone-${getAvatarTone(message.userId)}`,
								children: getInitials(message.name)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 542,
								columnNumber: 17
							}, this), /* @__PURE__ */ _jsxDEV("div", {
								className: "message-content",
								children: [/* @__PURE__ */ _jsxDEV("div", {
									className: "message-meta",
									children: [/* @__PURE__ */ _jsxDEV("strong", { children: message.userId === userId ? "你" : message.name }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 545,
										columnNumber: 21
									}, this), /* @__PURE__ */ _jsxDEV("time", { children: formatTime(message.createdAt) }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 546,
										columnNumber: 21
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 544,
									columnNumber: 19
								}, this), /* @__PURE__ */ _jsxDEV("p", { children: message.text }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 548,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 543,
								columnNumber: 17
							}, this)]
						}, message.id, true, {
							fileName: _jsxFileName,
							lineNumber: 541,
							columnNumber: 15
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 534,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ _jsxDEV("div", {
						className: "composer-wrap",
						children: [isBanned ? /* @__PURE__ */ _jsxDEV("div", {
							className: "ban-notice",
							children: [/* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("strong", { children: "你已被管理员封禁" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 559,
								columnNumber: 17
							}, this), /* @__PURE__ */ _jsxDEV("span", { children: "请联系管理员解封。" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 560,
								columnNumber: 17
							}, this)] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 558,
								columnNumber: 15
							}, this), /* @__PURE__ */ _jsxDEV("button", {
								className: "unban-request-button",
								type: "button",
								onClick: requestUnban,
								disabled: hasRequestedUnban,
								children: hasRequestedUnban ? "已申请解封" : "申请解封"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 562,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 557,
							columnNumber: 13
						}, this) : /* @__PURE__ */ _jsxDEV("form", {
							className: "composer",
							onSubmit: sendMessage,
							children: [/* @__PURE__ */ _jsxDEV("textarea", {
								"aria-label": "输入消息",
								value: draft,
								maxLength: 2e3,
								disabled: !accountVerified,
								onChange: (event) => setDraft(event.target.value),
								onKeyDown: handleComposerKeyDown,
								placeholder: accountVerified ? "写下你的消息…" : "正在验证账户…",
								rows: 1
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 568,
								columnNumber: 13
							}, this), /* @__PURE__ */ _jsxDEV("div", {
								className: "composer-actions",
								children: [/* @__PURE__ */ _jsxDEV("span", {
									className: "composer-hint",
									children: "Enter 发送 · Shift + Enter 换行"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 579,
									columnNumber: 15
								}, this), /* @__PURE__ */ _jsxDEV("button", {
									className: "send-button",
									type: "submit",
									disabled: !draft.trim() || sending || !accountVerified,
									"aria-label": "发送消息",
									children: sending ? "…" : "发送"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 580,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 578,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 567,
							columnNumber: 11
						}, this), /* @__PURE__ */ _jsxDEV("div", {
							className: "composer-footer",
							children: [/* @__PURE__ */ _jsxDEV("span", { children: "最多 2000 个字符" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 587,
								columnNumber: 13
							}, this), /* @__PURE__ */ _jsxDEV("span", { children: [draft.length, "/2000"] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 588,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 586,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 555,
						columnNumber: 9
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 435,
				columnNumber: 7
			}, this),
			showNameEditor && /* @__PURE__ */ _jsxDEV("div", {
				className: "modal-backdrop",
				role: "presentation",
				onMouseDown: () => setShowNameEditor(false),
				children: /* @__PURE__ */ _jsxDEV("div", {
					className: "name-modal",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "name-title",
					onMouseDown: (event) => event.stopPropagation(),
					children: [
						/* @__PURE__ */ _jsxDEV("div", {
							className: "modal-icon",
							children: "✦"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 596,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("h2", {
							id: "name-title",
							children: "换个名字"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 597,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("p", { children: "这个名字会显示在你发出的消息旁边。" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 598,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("input", {
							autoFocus: true,
							"aria-label": "你的名字",
							value: nameDraft,
							maxLength: 20,
							onChange: (event) => {
								const nextName = event.target.value;
								if (!nextName.trim()) {
									setNameDraft(name);
									setNameError("名称不能为空，已恢复为当前名称");
									return;
								}
								setNameDraft(nextName);
								setNameError("");
							},
							onKeyDown: (event) => event.key === "Enter" && void saveName()
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 599,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "name-rules",
							children: "名称不能重复 · 每 5 分钟最多修改一次"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 616,
							columnNumber: 13
						}, this),
						nameError && /* @__PURE__ */ _jsxDEV("div", {
							className: "name-error",
							role: "alert",
							children: nameError
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 617,
							columnNumber: 27
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "modal-actions",
							children: [/* @__PURE__ */ _jsxDEV("button", {
								className: "cancel-button",
								type: "button",
								onClick: () => setShowNameEditor(false),
								children: "取消"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 619,
								columnNumber: 15
							}, this), /* @__PURE__ */ _jsxDEV("button", {
								className: "save-button",
								type: "button",
								disabled: savingName || !nameDraft.trim(),
								onClick: () => void saveName(),
								children: savingName ? "保存中…" : "保存"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 620,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 618,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 595,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 594,
				columnNumber: 9
			}, this),
			showAdmin && /* @__PURE__ */ _jsxDEV("div", {
				className: "modal-backdrop",
				role: "presentation",
				onMouseDown: () => setShowAdmin(false),
				children: /* @__PURE__ */ _jsxDEV("div", {
					className: "admin-modal",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "admin-title",
					onMouseDown: (event) => event.stopPropagation(),
					children: [
						/* @__PURE__ */ _jsxDEV("div", {
							className: "admin-modal-header",
							children: [/* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("div", {
								className: "eyebrow",
								children: "仅限本机"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 631,
								columnNumber: 17
							}, this), /* @__PURE__ */ _jsxDEV("h2", {
								id: "admin-title",
								children: "管理员控制台"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 632,
								columnNumber: 17
							}, this)] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 630,
								columnNumber: 15
							}, this), /* @__PURE__ */ _jsxDEV("button", {
								className: "close-button",
								type: "button",
								onClick: () => setShowAdmin(false),
								"aria-label": "关闭管理面板",
								children: "×"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 634,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 629,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "admin-toolbar",
							children: [/* @__PURE__ */ _jsxDEV("span", { children: [adminMessages.length, " 条消息"] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 637,
								columnNumber: 15
							}, this), /* @__PURE__ */ _jsxDEV("button", {
								className: "clear-button",
								type: "button",
								onClick: clearAllMessages,
								disabled: !adminMessages.length,
								children: "清空消息"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 638,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 636,
							columnNumber: 13
						}, this),
						adminLoading ? /* @__PURE__ */ _jsxDEV("div", {
							className: "admin-empty",
							children: "正在读取管理数据…"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 641,
							columnNumber: 15
						}, this) : adminMessages.length === 0 ? /* @__PURE__ */ _jsxDEV("div", {
							className: "admin-empty",
							children: "当前没有消息。"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 643,
							columnNumber: 15
						}, this) : /* @__PURE__ */ _jsxDEV("div", {
							className: "admin-message-list",
							children: adminMessages.map((message) => /* @__PURE__ */ _jsxDEV("div", {
								className: "admin-message",
								children: [/* @__PURE__ */ _jsxDEV("div", {
									className: "admin-message-main",
									children: [/* @__PURE__ */ _jsxDEV("div", {
										className: "admin-message-meta",
										children: [/* @__PURE__ */ _jsxDEV("strong", { children: message.name }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 649,
											columnNumber: 61
										}, this), /* @__PURE__ */ _jsxDEV("span", { children: message.ipAddress }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 649,
											columnNumber: 92
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 649,
										columnNumber: 25
									}, this), /* @__PURE__ */ _jsxDEV("p", { children: message.text }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 650,
										columnNumber: 25
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 648,
									columnNumber: 23
								}, this), message.ipAddress !== "system" && /* @__PURE__ */ _jsxDEV("div", {
									className: "admin-message-actions",
									children: /* @__PURE__ */ _jsxDEV("button", {
										type: "button",
										onClick: () => deleteAdminMessage(message.id),
										children: "删除"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 654,
										columnNumber: 27
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 653,
									columnNumber: 25
								}, this)]
							}, message.id, true, {
								fileName: _jsxFileName,
								lineNumber: 647,
								columnNumber: 21
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 645,
							columnNumber: 15
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 628,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 627,
				columnNumber: 9
			}, this),
			isAdmin && unbanNotices.length > 0 && /* @__PURE__ */ _jsxDEV("div", {
				className: "unban-notices",
				"aria-live": "polite",
				children: unbanNotices.map((notice) => /* @__PURE__ */ _jsxDEV("div", {
					className: "unban-notice",
					children: [/* @__PURE__ */ _jsxDEV("span", {
						className: "unban-notice-mark",
						children: "!"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 669,
						columnNumber: 15
					}, this), /* @__PURE__ */ _jsxDEV("span", { children: [/* @__PURE__ */ _jsxDEV("strong", { children: notice.name }, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 670,
						columnNumber: 21
					}, this), " 想申请解封"] }, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 670,
						columnNumber: 15
					}, this)]
				}, notice.blockKey, true, {
					fileName: _jsxFileName,
					lineNumber: 668,
					columnNumber: 13
				}, this))
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 666,
				columnNumber: 9
			}, this),
			storageBlocked && /* @__PURE__ */ _jsxDEV("div", {
				className: "storage-gate",
				role: "alertdialog",
				"aria-modal": "true",
				"aria-labelledby": "storage-gate-title",
				children: /* @__PURE__ */ _jsxDEV("div", {
					className: "storage-gate-card",
					children: [
						/* @__PURE__ */ _jsxDEV("span", { children: "隐私模式不可用" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 679,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("h2", {
							id: "storage-gate-title",
							children: "请退出无痕/隐私浏览"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 680,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("p", { children: "聊天室需要浏览器持久保存访客身份。请使用普通窗口打开此页面，然后刷新重试。" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 681,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("button", {
							type: "button",
							onClick: () => window.location.reload(),
							children: "刷新重试"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 682,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 678,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 677,
				columnNumber: 9
			}, this),
			entryBlocked && !storageBlocked && /* @__PURE__ */ _jsxDEV("div", {
				className: "storage-gate",
				role: "alertdialog",
				"aria-modal": "true",
				"aria-labelledby": "account-gate-title",
				children: /* @__PURE__ */ _jsxDEV("div", {
					className: "storage-gate-card",
					children: [
						/* @__PURE__ */ _jsxDEV("span", { children: "无法进入聊天室" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 690,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("h2", {
							id: "account-gate-title",
							children: "此 IP 已有账户"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 691,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("p", { children: [entryBlocked, "。无痕窗口和新的浏览器账户不能再次登记。"] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 692,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("button", {
							type: "button",
							onClick: () => window.location.reload(),
							children: "使用原浏览器后重试"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 693,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 689,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 688,
				columnNumber: 9
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 407,
		columnNumber: 5
	}, this);
}
_s(Home, "9ToODywbZNXFCRHA8GOBMGC4G8Q=");
_c = Home;
var _c;
$RefreshReg$(_c, "Home");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
import * as __vite_react_currentExports from "/app/page.tsx?t=1786432136288";
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }

  const currentExports = __vite_react_currentExports;
  queueMicrotask(() => {
    RefreshRuntime.registerExportsForReactRefresh("/Users/jerry/Documents/Codex/2026-08-10/ni-b/app/page.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/Users/jerry/Documents/Codex/2026-08-10/ni-b/app/page.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) { return RefreshRuntime.register(type, "/Users/jerry/Documents/Codex/2026-08-10/ni-b/app/page.tsx" + ' ' + id); }
function $RefreshSig$() { return RefreshRuntime.createSignatureFunctionForTransform(); }

//# sourceMappingURL=data:application/json;base64,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RDtPQUFRLE1BQUs7T0FBUyxlQUFlLE9BQU8sU0FBUyxPQUFPO2lCQUFHO01BQWlCOzs7OztLQUM3RTs7Ozs7O0dBQ0Y7Ozs7O0VBRUg7Ozs7OztBQUVWIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbInBhZ2UudHN4Il0sInZlcnNpb24iOjMsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGNsaWVudFwiO1xuXG5pbXBvcnQgeyBGb3JtRXZlbnQsIEtleWJvYXJkRXZlbnQsIHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuXG50eXBlIENoYXRNZXNzYWdlID0ge1xuICBpZDogc3RyaW5nO1xuICB1c2VySWQ6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIGNyZWF0ZWRBdDogc3RyaW5nO1xufTtcblxudHlwZSBBZG1pbk1lc3NhZ2UgPSBDaGF0TWVzc2FnZSAmIHsgaXBBZGRyZXNzOiBzdHJpbmcgfTtcbnR5cGUgT25saW5lVXNlciA9IHsgdXNlcklkOiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgYmxvY2tLZXk/OiBzdHJpbmc7IGlzQWRtaW4/OiBib29sZWFuIH07XG50eXBlIEJhbm5lZFVzZXIgPSB7IGJsb2NrS2V5OiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgYmFubmVkQXQ6IHN0cmluZzsgcmVhc29uPzogc3RyaW5nIH07XG50eXBlIFVuYmFuUmVxdWVzdCA9IHsgYmxvY2tLZXk6IHN0cmluZzsgbmFtZTogc3RyaW5nOyByZXF1ZXN0ZWRBdDogc3RyaW5nIH07XG5cbmNvbnN0IG1ha2VHdWVzdE5hbWUgPSAoKSA9PiBg6K6/5a6iICR7TWF0aC5mbG9vcigxMDAgKyBNYXRoLnJhbmRvbSgpICogOTAwKX1gO1xuXG5hc3luYyBmdW5jdGlvbiBoYXNQZXJzaXN0ZW50QnJvd3NlclN0b3JhZ2UoKSB7XG4gIHRyeSB7XG4gICAgY29uc3Qga2V5ID0gXCJsYW4tY2hhdC1zdG9yYWdlLWNoZWNrXCI7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgXCJva1wiKTtcbiAgICBpZiAod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSkgIT09IFwib2tcIiB8fCAhd2luZG93LmluZGV4ZWREQikgcmV0dXJuIGZhbHNlO1xuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpO1xuICAgIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZTxib29sZWFuPigocmVzb2x2ZSkgPT4ge1xuICAgICAgY29uc3QgcmVxdWVzdCA9IHdpbmRvdy5pbmRleGVkREIub3BlbihcImxhbi1jaGF0LXN0b3JhZ2UtY2hlY2tcIiwgMSk7XG4gICAgICByZXF1ZXN0Lm9udXBncmFkZW5lZWRlZCA9ICgpID0+IHJlcXVlc3QucmVzdWx0LmNyZWF0ZU9iamVjdFN0b3JlKFwiY2hlY2tcIik7XG4gICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9ICgpID0+IHtcbiAgICAgICAgcmVxdWVzdC5yZXN1bHQuY2xvc2UoKTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgICByZXF1ZXN0Lm9uZXJyb3IgPSAoKSA9PiByZXNvbHZlKGZhbHNlKTtcbiAgICAgIHJlcXVlc3Qub25ibG9ja2VkID0gKCkgPT4gcmVzb2x2ZShmYWxzZSk7XG4gICAgfSk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmb3JtYXRDb29sZG93bihtaWxsaXNlY29uZHM6IG51bWJlcikge1xuICBjb25zdCBzZWNvbmRzID0gTWF0aC5tYXgoMSwgTWF0aC5jZWlsKG1pbGxpc2Vjb25kcyAvIDEwMDApKTtcbiAgaWYgKHNlY29uZHMgPCA2MCkgcmV0dXJuIGAke3NlY29uZHN9IOenkmA7XG4gIHJldHVybiBgJHtNYXRoLmNlaWwoc2Vjb25kcyAvIDYwKX0g5YiG6ZKfYDtcbn1cblxuZnVuY3Rpb24gZ2V0SW5pdGlhbHMobmFtZTogc3RyaW5nKSB7XG4gIHJldHVybiBuYW1lLnRyaW0oKS5zbGljZSgwLCAxKS50b1VwcGVyQ2FzZSgpIHx8IFwi6K6/XCI7XG59XG5cbmZ1bmN0aW9uIGdldEF2YXRhclRvbmUodXNlcklkOiBzdHJpbmcpIHtcbiAgbGV0IGhhc2ggPSAwO1xuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdXNlcklkLmxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGhhc2ggPSAoaGFzaCAqIDMxICsgdXNlcklkLmNoYXJDb2RlQXQoaW5kZXgpKSB8IDA7XG4gIH1cbiAgcmV0dXJuIE1hdGguYWJzKGhhc2gpICUgNjtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VGltZSh2YWx1ZTogc3RyaW5nKSB7XG4gIHJldHVybiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChcInpoLUNOXCIsIHtcbiAgICBob3VyOiBcIjItZGlnaXRcIixcbiAgICBtaW51dGU6IFwiMi1kaWdpdFwiLFxuICB9KS5mb3JtYXQobmV3IERhdGUodmFsdWUpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gSG9tZSgpIHtcbiAgY29uc3QgW25hbWUsIHNldE5hbWVdID0gdXNlU3RhdGUoXCLorr/lrqJcIik7XG4gIGNvbnN0IFtuYW1lRHJhZnQsIHNldE5hbWVEcmFmdF0gPSB1c2VTdGF0ZShcIuiuv+WuolwiKTtcbiAgY29uc3QgW21lc3NhZ2VzLCBzZXRNZXNzYWdlc10gPSB1c2VTdGF0ZTxDaGF0TWVzc2FnZVtdPihbXSk7XG4gIGNvbnN0IFtvbmxpbmVVc2Vycywgc2V0T25saW5lVXNlcnNdID0gdXNlU3RhdGU8T25saW5lVXNlcltdPihbXSk7XG4gIGNvbnN0IFttZXNzYWdlc0xvYWRpbmcsIHNldE1lc3NhZ2VzTG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgY29uc3QgW2RyYWZ0LCBzZXREcmFmdF0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW2Nvbm5lY3RlZCwgc2V0Q29ubmVjdGVkXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3NlbmRpbmcsIHNldFNlbmRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbc2hvd05hbWVFZGl0b3IsIHNldFNob3dOYW1lRWRpdG9yXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3NhdmluZ05hbWUsIHNldFNhdmluZ05hbWVdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbbmFtZUVycm9yLCBzZXROYW1lRXJyb3JdID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFtuZXh0TmFtZUNoYW5nZUF0LCBzZXROZXh0TmFtZUNoYW5nZUF0XSA9IHVzZVN0YXRlKDApO1xuICBjb25zdCBbc3RvcmFnZVJlYWR5LCBzZXRTdG9yYWdlUmVhZHldID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbc3RvcmFnZUJsb2NrZWQsIHNldFN0b3JhZ2VCbG9ja2VkXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2FjY291bnRUb2tlbiwgc2V0QWNjb3VudFRva2VuXSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBbYWNjb3VudFZlcmlmaWVkLCBzZXRBY2NvdW50VmVyaWZpZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbZW50cnlCbG9ja2VkLCBzZXRFbnRyeUJsb2NrZWRdID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFtzaG93T25saW5lTWVudSwgc2V0U2hvd09ubGluZU1lbnVdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbc2hvd0JsYWNrbGlzdE1lbnUsIHNldFNob3dCbGFja2xpc3RNZW51XSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2lzQWRtaW4sIHNldElzQWRtaW5dID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbc2hvd0FkbWluLCBzZXRTaG93QWRtaW5dID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbYWRtaW5NZXNzYWdlcywgc2V0QWRtaW5NZXNzYWdlc10gPSB1c2VTdGF0ZTxBZG1pbk1lc3NhZ2VbXT4oW10pO1xuICBjb25zdCBbYmFubmVkVXNlcnMsIHNldEJhbm5lZFVzZXJzXSA9IHVzZVN0YXRlPEJhbm5lZFVzZXJbXT4oW10pO1xuICBjb25zdCBbaXNCYW5uZWQsIHNldElzQmFubmVkXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2hhc1JlcXVlc3RlZFVuYmFuLCBzZXRIYXNSZXF1ZXN0ZWRVbmJhbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFt1bmJhbk5vdGljZXMsIHNldFVuYmFuTm90aWNlc10gPSB1c2VTdGF0ZTxVbmJhblJlcXVlc3RbXT4oW10pO1xuICBjb25zdCBbYWRtaW5Mb2FkaW5nLCBzZXRBZG1pbkxvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbdXNlcklkLCBzZXRVc2VySWRdID0gdXNlU3RhdGUoXCJ1c2VyLXBlbmRpbmdcIik7XG4gIGNvbnN0IGxpc3RSZWYgPSB1c2VSZWY8SFRNTERpdkVsZW1lbnQ+KG51bGwpO1xuICBjb25zdCBzZWVuVW5iYW5SZXF1ZXN0cyA9IHVzZVJlZihuZXcgU2V0PHN0cmluZz4oKSk7XG5cbiAgY29uc3QgaW5pdGlhbHMgPSB1c2VNZW1vKCgpID0+IGdldEluaXRpYWxzKG5hbWUpLCBbbmFtZV0pO1xuXG4gIGNvbnN0IHNob3dVbmJhbk5vdGljZSA9IChub3RpY2U6IFVuYmFuUmVxdWVzdCkgPT4ge1xuICAgIGNvbnN0IG5vdGljZUlkID0gYCR7bm90aWNlLmJsb2NrS2V5fToke25vdGljZS5yZXF1ZXN0ZWRBdH1gO1xuICAgIGNvbnN0IHJlbWFpbmluZyA9IDIwXzAwMCAtIChEYXRlLm5vdygpIC0gbmV3IERhdGUobm90aWNlLnJlcXVlc3RlZEF0KS5nZXRUaW1lKCkpO1xuICAgIGlmIChyZW1haW5pbmcgPD0gMCB8fCBzZWVuVW5iYW5SZXF1ZXN0cy5jdXJyZW50Lmhhcyhub3RpY2VJZCkpIHJldHVybjtcbiAgICBzZWVuVW5iYW5SZXF1ZXN0cy5jdXJyZW50LmFkZChub3RpY2VJZCk7XG4gICAgc2V0VW5iYW5Ob3RpY2VzKChjdXJyZW50KSA9PiBbLi4uY3VycmVudC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uYmxvY2tLZXkgIT09IG5vdGljZS5ibG9ja0tleSksIG5vdGljZV0pO1xuICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNldFVuYmFuTm90aWNlcygoY3VycmVudCkgPT4gY3VycmVudC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uYmxvY2tLZXkgIT09IG5vdGljZS5ibG9ja0tleSkpO1xuICAgIH0sIHJlbWFpbmluZyk7XG4gIH07XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRJc0FkbWluKFtcImxvY2FsaG9zdFwiLCBcIjEyNy4wLjAuMVwiLCBcIjo6MVwiXS5pbmNsdWRlcyh3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUpKTtcbiAgICBsZXQgc3RyZWFtOiBFdmVudFNvdXJjZSB8IG51bGwgPSBudWxsO1xuICAgIGxldCBkaXNwb3NlZCA9IGZhbHNlO1xuXG4gICAgY29uc3Qgc3RhcnQgPSBhc3luYyAoKSA9PiB7XG4gICAgICBpZiAoIShhd2FpdCBoYXNQZXJzaXN0ZW50QnJvd3NlclN0b3JhZ2UoKSkpIHtcbiAgICAgICAgaWYgKCFkaXNwb3NlZCkgc2V0U3RvcmFnZUJsb2NrZWQodHJ1ZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChkaXNwb3NlZCkgcmV0dXJuO1xuICAgICAgc2V0U3RvcmFnZVJlYWR5KHRydWUpO1xuICAgICAgY29uc3Qgc2F2ZWRVc2VySWQgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJsYW4tY2hhdC11c2VyLWlkXCIpIHx8IGB1c2VyLSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgMTApfWA7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJsYW4tY2hhdC11c2VyLWlkXCIsIHNhdmVkVXNlcklkKTtcbiAgICAgIHNldFVzZXJJZChzYXZlZFVzZXJJZCk7XG4gICAgICBzZXRBY2NvdW50VG9rZW4od2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibGFuLWNoYXQtYWNjb3VudC10b2tlblwiKSB8fCBcIlwiKTtcblxuICAgICAgY29uc3Qgc2F2ZWROYW1lID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibGFuLWNoYXQtbmFtZVwiKSB8fCBtYWtlR3Vlc3ROYW1lKCk7XG4gICAgICBzZXROYW1lKHNhdmVkTmFtZSk7XG4gICAgICBzZXROYW1lRHJhZnQoc2F2ZWROYW1lKTtcblxuICAgICAgZmV0Y2goXCIvYXBpL21lc3NhZ2VzXCIpXG4gICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgICAudGhlbigoZGF0YTogeyBtZXNzYWdlcz86IENoYXRNZXNzYWdlW10gfSkgPT4gc2V0TWVzc2FnZXMoZGF0YS5tZXNzYWdlcyB8fCBbXSkpXG4gICAgICAgIC5jYXRjaCgoKSA9PiBzZXRDb25uZWN0ZWQoZmFsc2UpKVxuICAgICAgICAuZmluYWxseSgoKSA9PiBzZXRNZXNzYWdlc0xvYWRpbmcoZmFsc2UpKTtcblxuICAgICAgc3RyZWFtID0gbmV3IEV2ZW50U291cmNlKFwiL2FwaS9zdHJlYW1cIik7XG4gICAgICBzdHJlYW0ub25vcGVuID0gKCkgPT4gc2V0Q29ubmVjdGVkKHRydWUpO1xuICAgICAgc3RyZWFtLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgICBjb25zdCBpbmNvbWluZyA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSkgYXMgQ2hhdE1lc3NhZ2U7XG4gICAgICAgIHNldE1lc3NhZ2VzKChjdXJyZW50KSA9PlxuICAgICAgICAgIGN1cnJlbnQuc29tZSgobWVzc2FnZSkgPT4gbWVzc2FnZS5pZCA9PT0gaW5jb21pbmcuaWQpID8gY3VycmVudCA6IFsuLi5jdXJyZW50LCBpbmNvbWluZ10sXG4gICAgICAgICk7XG4gICAgICB9O1xuICAgICAgc3RyZWFtLmFkZEV2ZW50TGlzdGVuZXIoXCJkZWxldGVcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGRlbGV0ZWQgPSBKU09OLnBhcnNlKChldmVudCBhcyBNZXNzYWdlRXZlbnQpLmRhdGEpIGFzIHsgaWQ6IHN0cmluZyB9O1xuICAgICAgICBzZXRNZXNzYWdlcygoY3VycmVudCkgPT4gY3VycmVudC5maWx0ZXIoKG1lc3NhZ2UpID0+IG1lc3NhZ2UuaWQgIT09IGRlbGV0ZWQuaWQpKTtcbiAgICAgIH0pO1xuICAgICAgc3RyZWFtLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGVhclwiLCAoKSA9PiBzZXRNZXNzYWdlcyhbXSkpO1xuICAgICAgc3RyZWFtLmFkZEV2ZW50TGlzdGVuZXIoXCJwcmVzZW5jZVwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgdXBkYXRlID0gSlNPTi5wYXJzZSgoZXZlbnQgYXMgTWVzc2FnZUV2ZW50KS5kYXRhKSBhcyB7IHVzZXJzPzogT25saW5lVXNlcltdIH07XG4gICAgICAgIHNldE9ubGluZVVzZXJzKHVwZGF0ZS51c2VycyB8fCBbXSk7XG4gICAgICB9KTtcbiAgICAgIHN0cmVhbS5hZGRFdmVudExpc3RlbmVyKFwidW5iYW4tcmVxdWVzdFwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IEpTT04ucGFyc2UoKGV2ZW50IGFzIE1lc3NhZ2VFdmVudCkuZGF0YSkgYXMgeyByZXF1ZXN0OiBVbmJhblJlcXVlc3QgfTtcbiAgICAgICAgc2hvd1VuYmFuTm90aWNlKHJlcXVlc3QucmVxdWVzdCk7XG4gICAgICB9KTtcbiAgICAgIHN0cmVhbS5vbmVycm9yID0gKCkgPT4gc2V0Q29ubmVjdGVkKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgdm9pZCBzdGFydCgpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBkaXNwb3NlZCA9IHRydWU7XG4gICAgICBzdHJlYW0/LmNsb3NlKCk7XG4gICAgfTtcbiAgfSwgW10pO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFzdG9yYWdlUmVhZHkgfHwgdXNlcklkID09PSBcInVzZXItcGVuZGluZ1wiKSByZXR1cm47XG4gICAgbGV0IGFjdGl2ZSA9IHRydWU7XG4gICAgY29uc3QgYW5ub3VuY2VQcmVzZW5jZSA9ICgpID0+IHtcbiAgICAgIGZldGNoKFwiL2FwaS9wcmVzZW5jZVwiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyB1c2VySWQsIG5hbWUsIGFjY291bnRUb2tlbiB9KSxcbiAgICAgIH0pXG4gICAgICAgIC50aGVuKGFzeW5jIChyZXNwb25zZSkgPT4gKHsgcmVzcG9uc2UsIGRhdGE6IGF3YWl0IHJlc3BvbnNlLmpzb24oKSBhcyB7XG4gICAgICAgICAgZXJyb3I/OiBzdHJpbmc7XG4gICAgICAgICAgY29kZT86IHN0cmluZztcbiAgICAgICAgICB1c2Vycz86IE9ubGluZVVzZXJbXTtcbiAgICAgICAgICBjdXJyZW50TmFtZT86IHN0cmluZztcbiAgICAgICAgICBhY2NvdW50VG9rZW4/OiBzdHJpbmc7XG4gICAgICAgICAgbmV4dE5hbWVDaGFuZ2VBdD86IG51bWJlcjtcbiAgICAgICAgICBpc0Jhbm5lZD86IGJvb2xlYW47XG4gICAgICAgICAgaGFzUmVxdWVzdGVkVW5iYW4/OiBib29sZWFuO1xuICAgICAgICB9IH0pKVxuICAgICAgICAudGhlbigoeyByZXNwb25zZSwgZGF0YSB9KSA9PiB7XG4gICAgICAgICAgaWYgKCFhY3RpdmUpIHJldHVybjtcbiAgICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICBzZXRBY2NvdW50VmVyaWZpZWQoZmFsc2UpO1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAzKSB7XG4gICAgICAgICAgICAgIHNldEVudHJ5QmxvY2tlZChkYXRhLmVycm9yIHx8IFwi5q2kIElQIOW3sue7keWumuWFtuS7lui0puaIt1wiKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDA5KSB7XG4gICAgICAgICAgICAgIHNldE5hbWVFcnJvcihkYXRhLmVycm9yIHx8IFwi6K+l5ZCN56ew5bey6KKr5L2/55SoXCIpO1xuICAgICAgICAgICAgICBzZXRTaG93TmFtZUVkaXRvcih0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2V0RW50cnlCbG9ja2VkKFwiXCIpO1xuICAgICAgICAgIHNldEFjY291bnRWZXJpZmllZCh0cnVlKTtcbiAgICAgICAgICBzZXRPbmxpbmVVc2VycyhkYXRhLnVzZXJzIHx8IFtdKTtcbiAgICAgICAgICBzZXRJc0Jhbm5lZChCb29sZWFuKGRhdGEuaXNCYW5uZWQpKTtcbiAgICAgICAgICBzZXRIYXNSZXF1ZXN0ZWRVbmJhbihCb29sZWFuKGRhdGEuaGFzUmVxdWVzdGVkVW5iYW4pKTtcbiAgICAgICAgICBzZXROZXh0TmFtZUNoYW5nZUF0KGRhdGEubmV4dE5hbWVDaGFuZ2VBdCB8fCAwKTtcbiAgICAgICAgICBpZiAoZGF0YS5hY2NvdW50VG9rZW4gJiYgZGF0YS5hY2NvdW50VG9rZW4gIT09IGFjY291bnRUb2tlbikge1xuICAgICAgICAgICAgc2V0QWNjb3VudFRva2VuKGRhdGEuYWNjb3VudFRva2VuKTtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImxhbi1jaGF0LWFjY291bnQtdG9rZW5cIiwgZGF0YS5hY2NvdW50VG9rZW4pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZGF0YS5jdXJyZW50TmFtZSAmJiBkYXRhLmN1cnJlbnROYW1lICE9PSBuYW1lKSB7XG4gICAgICAgICAgICBzZXROYW1lKGRhdGEuY3VycmVudE5hbWUpO1xuICAgICAgICAgICAgc2V0TmFtZURyYWZ0KGRhdGEuY3VycmVudE5hbWUpO1xuICAgICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibGFuLWNoYXQtbmFtZVwiLCBkYXRhLmN1cnJlbnROYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoKSA9PiB1bmRlZmluZWQpO1xuICAgIH07XG5cbiAgICBhbm5vdW5jZVByZXNlbmNlKCk7XG4gICAgY29uc3QgdGltZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoYW5ub3VuY2VQcmVzZW5jZSwgMTVfMDAwKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgYWN0aXZlID0gZmFsc2U7XG4gICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aW1lcik7XG4gICAgfTtcbiAgfSwgW2FjY291bnRUb2tlbiwgbmFtZSwgc3RvcmFnZVJlYWR5LCB1c2VySWRdKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghaXNBZG1pbikgcmV0dXJuO1xuICAgIGxldCBhY3RpdmUgPSB0cnVlO1xuICAgIGNvbnN0IHJlZnJlc2hBZG1pblN0YXRlID0gKCkgPT4ge1xuICAgICAgZmV0Y2goXCIvYXBpL2FkbWluL21lc3NhZ2VzXCIpXG4gICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgICAudGhlbigoZGF0YTogeyBiYW5uZWRVc2Vycz86IEJhbm5lZFVzZXJbXTsgdW5iYW5SZXF1ZXN0cz86IFVuYmFuUmVxdWVzdFtdIH0pID0+IHtcbiAgICAgICAgICBpZiAoIWFjdGl2ZSkgcmV0dXJuO1xuICAgICAgICAgIHNldEJhbm5lZFVzZXJzKGRhdGEuYmFubmVkVXNlcnMgfHwgW10pO1xuICAgICAgICAgIChkYXRhLnVuYmFuUmVxdWVzdHMgfHwgW10pLmZvckVhY2goc2hvd1VuYmFuTm90aWNlKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKCgpID0+IHVuZGVmaW5lZCk7XG4gICAgfTtcbiAgICByZWZyZXNoQWRtaW5TdGF0ZSgpO1xuICAgIGNvbnN0IHRpbWVyID0gd2luZG93LnNldEludGVydmFsKHJlZnJlc2hBZG1pblN0YXRlLCAyXzAwMCk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGFjdGl2ZSA9IGZhbHNlO1xuICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGltZXIpO1xuICAgIH07XG4gIH0sIFtpc0FkbWluXSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBsaXN0ID0gbGlzdFJlZi5jdXJyZW50O1xuICAgIGlmIChsaXN0KSBsaXN0LnNjcm9sbFRvcCA9IGxpc3Quc2Nyb2xsSGVpZ2h0O1xuICB9LCBbbWVzc2FnZXNdKTtcblxuICBjb25zdCBzYXZlTmFtZSA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBuZXh0TmFtZSA9IG5hbWVEcmFmdC50cmltKCkuc2xpY2UoMCwgMjApO1xuICAgIGlmICghbmV4dE5hbWUgfHwgc2F2aW5nTmFtZSkgcmV0dXJuO1xuICAgIGlmIChuZXh0TmFtZUNoYW5nZUF0ID4gRGF0ZS5ub3coKSAmJiBuZXh0TmFtZS50b0xvY2FsZUxvd2VyQ2FzZShcInpoLUNOXCIpICE9PSBuYW1lLnRvTG9jYWxlTG93ZXJDYXNlKFwiemgtQ05cIikpIHtcbiAgICAgIHNldE5hbWVFcnJvcihg5q+PIDUg5YiG6ZKf5pyA5aSa5L+u5pS55LiA5qyh77yM6L+Y6ZyA562J5b6FICR7Zm9ybWF0Q29vbGRvd24obmV4dE5hbWVDaGFuZ2VBdCAtIERhdGUubm93KCkpfWApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNldFNhdmluZ05hbWUodHJ1ZSk7XG4gICAgc2V0TmFtZUVycm9yKFwiXCIpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGFjY291bnRWZXJpZmllZCA/IFwiL2FwaS9wcm9maWxlL25hbWVcIiA6IFwiL2FwaS9wcmVzZW5jZVwiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyB1c2VySWQsIG5hbWU6IG5leHROYW1lLCBhY2NvdW50VG9rZW4gfSksXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzcG9uc2UuanNvbigpKSBhcyB7XG4gICAgICAgIGVycm9yPzogc3RyaW5nO1xuICAgICAgICBjb2RlPzogc3RyaW5nO1xuICAgICAgICBuYW1lPzogc3RyaW5nO1xuICAgICAgICBjdXJyZW50TmFtZT86IHN0cmluZztcbiAgICAgICAgYWNjb3VudFRva2VuPzogc3RyaW5nO1xuICAgICAgICBuZXh0TmFtZUNoYW5nZUF0PzogbnVtYmVyO1xuICAgICAgfTtcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAzICYmIGRhdGEuY29kZT8uaW5jbHVkZXMoXCJBQ0NPVU5UXCIpKSB7XG4gICAgICAgICAgc2V0RW50cnlCbG9ja2VkKGRhdGEuZXJyb3IgfHwgXCLmraQgSVAg5bey57uR5a6a5YW25LuW6LSm5oi3XCIpO1xuICAgICAgICAgIHNldFNob3dOYW1lRWRpdG9yKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwMykge1xuICAgICAgICAgIHNldElzQmFubmVkKHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIHNldE5hbWVFcnJvcihkYXRhLmVycm9yIHx8IFwi5ZCN56ew5L+u5pS55aSx6LSlXCIpO1xuICAgICAgICBpZiAoZGF0YS5uZXh0TmFtZUNoYW5nZUF0KSBzZXROZXh0TmFtZUNoYW5nZUF0KGRhdGEubmV4dE5hbWVDaGFuZ2VBdCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNhdmVkTmFtZSA9IGRhdGEubmFtZSB8fCBkYXRhLmN1cnJlbnROYW1lIHx8IG5leHROYW1lO1xuICAgICAgc2V0TmFtZShzYXZlZE5hbWUpO1xuICAgICAgc2V0TmFtZURyYWZ0KHNhdmVkTmFtZSk7XG4gICAgICBzZXROZXh0TmFtZUNoYW5nZUF0KGRhdGEubmV4dE5hbWVDaGFuZ2VBdCB8fCAwKTtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImxhbi1jaGF0LW5hbWVcIiwgc2F2ZWROYW1lKTtcbiAgICAgIGlmIChkYXRhLmFjY291bnRUb2tlbikge1xuICAgICAgICBzZXRBY2NvdW50VG9rZW4oZGF0YS5hY2NvdW50VG9rZW4pO1xuICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJsYW4tY2hhdC1hY2NvdW50LXRva2VuXCIsIGRhdGEuYWNjb3VudFRva2VuKTtcbiAgICAgIH1cbiAgICAgIHNldEFjY291bnRWZXJpZmllZCh0cnVlKTtcbiAgICAgIHNldFNob3dOYW1lRWRpdG9yKGZhbHNlKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHNldE5hbWVFcnJvcihcIuWQjeensOS/ruaUueWksei0pe+8jOivt+ehruiupOiBiuWkqeWupOacjeWKoeS7jeWcqOi/kOihjFwiKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0U2F2aW5nTmFtZShmYWxzZSk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IG9wZW5BZG1pbiA9IGFzeW5jICgpID0+IHtcbiAgICBzZXRTaG93QWRtaW4odHJ1ZSk7XG4gICAgc2V0QWRtaW5Mb2FkaW5nKHRydWUpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFwiL2FwaS9hZG1pbi9tZXNzYWdlc1wiKTtcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihcImFkbWluIHVuYXZhaWxhYmxlXCIpO1xuICAgICAgY29uc3QgZGF0YSA9IChhd2FpdCByZXNwb25zZS5qc29uKCkpIGFzIHsgbWVzc2FnZXM6IEFkbWluTWVzc2FnZVtdOyBiYW5uZWRVc2VyczogQmFubmVkVXNlcltdOyB1bmJhblJlcXVlc3RzOiBVbmJhblJlcXVlc3RbXSB9O1xuICAgICAgc2V0QWRtaW5NZXNzYWdlcyhkYXRhLm1lc3NhZ2VzIHx8IFtdKTtcbiAgICAgIHNldEJhbm5lZFVzZXJzKGRhdGEuYmFubmVkVXNlcnMgfHwgW10pO1xuICAgICAgKGRhdGEudW5iYW5SZXF1ZXN0cyB8fCBbXSkuZm9yRWFjaChzaG93VW5iYW5Ob3RpY2UpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgc2V0U2hvd0FkbWluKGZhbHNlKTtcbiAgICAgIHdpbmRvdy5hbGVydChcIueuoeeQhuWRmOaOpeWPo+S4jeWPr+eUqO+8jOivt+ehruiupOS9oOaYr+mAmui/hyBsb2NhbGhvc3Q6MzAwMCDmiZPlvIDnmoTjgIJcIik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEFkbWluTG9hZGluZyhmYWxzZSk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGRlbGV0ZUFkbWluTWVzc2FnZSA9IGFzeW5jIChpZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgL2FwaS9hZG1pbi9tZXNzYWdlcz9pZD0ke2VuY29kZVVSSUNvbXBvbmVudChpZCl9YCwgeyBtZXRob2Q6IFwiREVMRVRFXCIgfSk7XG4gICAgaWYgKCFyZXNwb25zZS5vaykgcmV0dXJuO1xuICAgIHNldEFkbWluTWVzc2FnZXMoKGN1cnJlbnQpID0+IGN1cnJlbnQuZmlsdGVyKChtZXNzYWdlKSA9PiBtZXNzYWdlLmlkICE9PSBpZCkpO1xuICAgIHNldE1lc3NhZ2VzKChjdXJyZW50KSA9PiBjdXJyZW50LmZpbHRlcigobWVzc2FnZSkgPT4gbWVzc2FnZS5pZCAhPT0gaWQpKTtcbiAgfTtcblxuICBjb25zdCBjbGVhckFsbE1lc3NhZ2VzID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghd2luZG93LmNvbmZpcm0oXCLnoa7lrprmuIXnqbrlhajpg6jmtojmga/lkJfvvJ/mraTmk43kvZzkuI3lj6/mgaLlpI3jgIJcIikpIHJldHVybjtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFwiL2FwaS9hZG1pbi9tZXNzYWdlcz9hbGw9dHJ1ZVwiLCB7IG1ldGhvZDogXCJERUxFVEVcIiB9KTtcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSByZXR1cm47XG4gICAgc2V0QWRtaW5NZXNzYWdlcyhbXSk7XG4gICAgc2V0TWVzc2FnZXMoW10pO1xuICB9O1xuXG4gIGNvbnN0IHRvZ2dsZUJhbiA9IGFzeW5jIChpcEFkZHJlc3M6IHN0cmluZywgbmFtZSA9IFwi5pyq55+l6K6/5a6iXCIpID0+IHtcbiAgICBjb25zdCBpc0Jhbm5lZCA9IGJhbm5lZFVzZXJzLnNvbWUoKHVzZXIpID0+IHVzZXIuYmxvY2tLZXkgPT09IGlwQWRkcmVzcyk7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChpc0Jhbm5lZCA/IGAvYXBpL2FkbWluL2Jhbj9pcD0ke2VuY29kZVVSSUNvbXBvbmVudChpcEFkZHJlc3MpfWAgOiBcIi9hcGkvYWRtaW4vYmFuXCIsIHtcbiAgICAgIG1ldGhvZDogaXNCYW5uZWQgPyBcIkRFTEVURVwiIDogXCJQT1NUXCIsXG4gICAgICBoZWFkZXJzOiBpc0Jhbm5lZCA/IHVuZGVmaW5lZCA6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgIGJvZHk6IGlzQmFubmVkID8gdW5kZWZpbmVkIDogSlNPTi5zdHJpbmdpZnkoeyBpcEFkZHJlc3MsIG5hbWUgfSksXG4gICAgfSk7XG4gICAgaWYgKCFyZXNwb25zZS5vaykgcmV0dXJuO1xuICAgIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzcG9uc2UuanNvbigpKSBhcyB7IGJhbm5lZFVzZXJzOiBCYW5uZWRVc2VyW10gfTtcbiAgICBzZXRCYW5uZWRVc2VycyhkYXRhLmJhbm5lZFVzZXJzIHx8IFtdKTtcbiAgfTtcblxuICBjb25zdCByZXF1ZXN0VW5iYW4gPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKGhhc1JlcXVlc3RlZFVuYmFuKSByZXR1cm47XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcIi9hcGkvdW5iYW4tcmVxdWVzdFwiLCB7XG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyB1c2VySWQsIGFjY291bnRUb2tlbiB9KSxcbiAgICB9KTtcbiAgICBpZiAocmVzcG9uc2Uub2sgfHwgcmVzcG9uc2Uuc3RhdHVzID09PSA0MDkpIHNldEhhc1JlcXVlc3RlZFVuYmFuKHRydWUpO1xuICB9O1xuXG4gIGNvbnN0IHNlbmRNZXNzYWdlID0gYXN5bmMgKGV2ZW50OiBGb3JtRXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGNvbnN0IHRleHQgPSBkcmFmdC50cmltKCk7XG4gICAgaWYgKCF0ZXh0IHx8IHNlbmRpbmcgfHwgaXNCYW5uZWQgfHwgIWFjY291bnRWZXJpZmllZCkgcmV0dXJuO1xuXG4gICAgc2V0U2VuZGluZyh0cnVlKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcIi9hcGkvbWVzc2FnZXNcIiwge1xuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgdXNlcklkLCBhY2NvdW50VG9rZW4sIHRleHQgfSksXG4gICAgICB9KTtcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwMykge1xuICAgICAgICBjb25zdCBkYXRhID0gKGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiBudWxsKSkgYXMgeyBjb2RlPzogc3RyaW5nOyBlcnJvcj86IHN0cmluZzsgcmVhc29uPzogc3RyaW5nIH0gfCBudWxsO1xuICAgICAgICBpZiAoZGF0YT8uY29kZT8uaW5jbHVkZXMoXCJBQ0NPVU5UXCIpKSB7XG4gICAgICAgICAgc2V0QWNjb3VudFZlcmlmaWVkKGZhbHNlKTtcbiAgICAgICAgICBzZXRFbnRyeUJsb2NrZWQoZGF0YS5lcnJvciB8fCBcIui0puaIt+WHreivgeaXoOaViFwiKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2V0SXNCYW5uZWQodHJ1ZSk7XG4gICAgICAgIGlmIChkYXRhPy5yZWFzb24pIHdpbmRvdy5hbGVydChg57O757uf5bey6Ieq5Yqo5bCB56aB77yaJHtkYXRhLnJlYXNvbn1gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKFwic2VuZCBmYWlsZWRcIik7XG4gICAgICBjb25zdCBtZXNzYWdlID0gKGF3YWl0IHJlc3BvbnNlLmpzb24oKSkgYXMgQ2hhdE1lc3NhZ2U7XG4gICAgICBzZXRNZXNzYWdlcygoY3VycmVudCkgPT5cbiAgICAgICAgY3VycmVudC5zb21lKChpdGVtKSA9PiBpdGVtLmlkID09PSBtZXNzYWdlLmlkKSA/IGN1cnJlbnQgOiBbLi4uY3VycmVudCwgbWVzc2FnZV0sXG4gICAgICApO1xuICAgICAgc2V0RHJhZnQoXCJcIik7XG4gICAgfSBjYXRjaCB7XG4gICAgICB3aW5kb3cuYWxlcnQoXCLmtojmga/lj5HpgIHlpLHotKXvvIzor7fnoa7orqTogYrlpKnlrqTmnI3liqHku43lnKjov5DooYzjgIJcIik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldFNlbmRpbmcoZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBoYW5kbGVDb21wb3NlcktleURvd24gPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQ8SFRNTFRleHRBcmVhRWxlbWVudD4pID0+IHtcbiAgICBpZiAoZXZlbnQua2V5ID09PSBcIkVudGVyXCIgJiYgIWV2ZW50LnNoaWZ0S2V5KSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5mb3JtPy5yZXF1ZXN0U3VibWl0KCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPG1haW4gY2xhc3NOYW1lPVwiY2hhdC1zaGVsbFwiPlxuICAgICAgPGFzaWRlIGNsYXNzTmFtZT1cInNpZGViYXJcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJicmFuZFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImJyYW5kLW1hcmtcIj7ihpc8L3NwYW4+XG4gICAgICAgICAgPHNwYW4+5ZCM6aKRPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndvcmtzcGFjZS1sYWJlbFwiPuaIkeeahOepuumXtDwvZGl2PlxuICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cInJvb20gYWN0aXZlXCIgdHlwZT1cImJ1dHRvblwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInJvb20taWNvblwiPiM8L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwicm9vbS1jb3B5XCI+XG4gICAgICAgICAgICA8c3Ryb25nPuWkp+WOhTwvc3Ryb25nPlxuICAgICAgICAgICAgPHNtYWxsPumaj+aXtuiBiuS4pOWPpTwvc21hbGw+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInJvb20tZG90XCIgLz5cbiAgICAgICAgPC9idXR0b24+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzaWRlYmFyLW5vdGVcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJub3RlLWljb25cIj7inKY8L3NwYW4+XG4gICAgICAgICAgPHA+6L+Z5piv5LiA5Liq6L276YeP55qE5bGA5Z+f572R6IGK5aSp5a6k44CC5oqK5Zyw5Z2A5YiG5Lqr57uZ5ZCM5LiA572R57uc5LiL55qE5pyL5Y+L77yM5bCx5Y+v5Lul5LiA6LW36IGK5aSp44CCPC9wPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNpZGViYXItZm9vdGVyXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgc3RhdHVzLWxpZ2h0ICR7Y29ubmVjdGVkID8gXCJvbmxpbmVcIiA6IFwib2ZmbGluZVwifWB9IC8+XG4gICAgICAgICAgPHNwYW4+e2Nvbm5lY3RlZCA/IFwi5pyN5Yqh5bey6L+e5o6lXCIgOiBcIuato+WcqOi/nuaOpeKAplwifTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2FzaWRlPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJjaGF0LXBhbmVsXCI+XG4gICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwiY2hhdC1oZWFkZXJcIj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJleWVicm93XCI+5YWs5YWx6aKR6YGTPC9kaXY+XG4gICAgICAgICAgICA8aDE+5aSn5Y6FPC9oMT5cbiAgICAgICAgICAgIDxwPuWSjOWcqOWcuueahOS6uuivtOeCueS7gOS5iDwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImhlYWRlci1hY3Rpb25zXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9ubGluZS1tZW51LXdyYXBcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJvbmxpbmUtbWVudS1idXR0b25cIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldFNob3dPbmxpbmVNZW51KChjdXJyZW50KSA9PiAhY3VycmVudCk7XG4gICAgICAgICAgICAgICAgc2V0U2hvd0JsYWNrbGlzdE1lbnUoZmFsc2UpO1xuICAgICAgICAgICAgICB9fSBhcmlhLWV4cGFuZGVkPXtzaG93T25saW5lTWVudX0gYXJpYS1jb250cm9scz1cIm9ubGluZS1tZW51XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwib25saW5lLW1lbnUtZG90XCIgLz5cbiAgICAgICAgICAgICAgICA8c3Bhbj7lnKjnur8ge29ubGluZVVzZXJzLmxlbmd0aH0g5Lq6PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImNoZXZyb25cIj7ijIQ8L3NwYW4+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICB7c2hvd09ubGluZU1lbnUgJiYgKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib25saW5lLW1lbnVcIiBpZD1cIm9ubGluZS1tZW51XCIgcm9sZT1cIm1lbnVcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib25saW5lLW1lbnUtaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+5Zyo57q/5YiX6KGoPC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPuWPr+afpeeci+WQjeensDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAge29ubGluZVVzZXJzLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvbmxpbmUtbWVudS1lbXB0eVwiPuaaguaXtuayoeacieWcqOe6v+eUqOaItzwvZGl2PlxuICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvbmxpbmUtbWVudS1saXN0XCI+XG4gICAgICAgICAgICAgICAgICAgICAge29ubGluZVVzZXJzLm1hcCgodXNlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYmxvY2tLZXkgPSB1c2VyLmJsb2NrS2V5IHx8IGB2aXNpdG9yOiR7dXNlci51c2VySWR9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzQmFubmVkID0gYmFubmVkVXNlcnMuc29tZSgoYmFubmVkVXNlcikgPT4gYmFubmVkVXNlci5ibG9ja0tleSA9PT0gYmxvY2tLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvbmxpbmUtbWVudS11c2VyXCIga2V5PXt1c2VyLnVzZXJJZH0gcm9sZT1cIm1lbnVpdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgb25saW5lLWF2YXRhciBhdmF0YXIgdG9uZS0ke2dldEF2YXRhclRvbmUodXNlci51c2VySWQpfWB9PntnZXRJbml0aWFscyh1c2VyLm5hbWUpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJvbmxpbmUtbWVudS1uYW1lXCI+e3VzZXIubmFtZX17dXNlci51c2VySWQgPT09IHVzZXJJZCA/IDxzbWFsbD7kvaA8L3NtYWxsPiA6IG51bGx9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm9ubGluZS1kb3RcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtpc0FkbWluICYmICF1c2VyLmlzQWRtaW4gJiYgdXNlci51c2VySWQgIT09IHVzZXJJZCAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIm9ubGluZS1iYW4tYnV0dG9uXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHRvZ2dsZUJhbihibG9ja0tleSwgdXNlci5uYW1lKX0+e2lzQmFubmVkID8gXCLop6PlsIFcIiA6IFwi5bCB56aBXCJ9PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHtpc0FkbWluICYmIChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvbmxpbmUtbWVudS13cmFwXCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJvbmxpbmUtbWVudS1idXR0b24gYmxhY2tsaXN0LW1lbnUtYnV0dG9uXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgIHNldFNob3dCbGFja2xpc3RNZW51KChjdXJyZW50KSA9PiAhY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICBzZXRTaG93T25saW5lTWVudShmYWxzZSk7XG4gICAgICAgICAgICAgICAgfX0gYXJpYS1leHBhbmRlZD17c2hvd0JsYWNrbGlzdE1lbnV9IGFyaWEtY29udHJvbHM9XCJibGFja2xpc3QtbWVudVwiPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiYmxhY2tsaXN0LW1lbnUtZG90XCI+w5c8L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3Bhbj7pu5HlkI3ljZUge2Jhbm5lZFVzZXJzLmxlbmd0aH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJjaGV2cm9uXCI+4oyEPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIHtzaG93QmxhY2tsaXN0TWVudSAmJiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9ubGluZS1tZW51IGJsYWNrbGlzdC1tZW51XCIgaWQ9XCJibGFja2xpc3QtbWVudVwiIHJvbGU9XCJtZW51XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib25saW5lLW1lbnUtaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz7pu5HlkI3ljZU8L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj7pmo/ml7blj6/ku6Xop6PlsIE8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7YmFubmVkVXNlcnMubGVuZ3RoID09PSAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib25saW5lLW1lbnUtZW1wdHlcIj7mmoLml6DlsIHnpoHorrDlvZU8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9ubGluZS1tZW51LWxpc3RcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtiYW5uZWRVc2Vycy5tYXAoKGJhbm5lZFVzZXIpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJibGFja2xpc3QtbWVudS11c2VyXCIga2V5PXtiYW5uZWRVc2VyLmJsb2NrS2V5fSByb2xlPVwibWVudWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJibGFja2xpc3QtbWVudS12YWx1ZVwiIHRpdGxlPXtiYW5uZWRVc2VyLnJlYXNvbn0+e2Jhbm5lZFVzZXIubmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gdG9nZ2xlQmFuKGJhbm5lZFVzZXIuYmxvY2tLZXksIGJhbm5lZFVzZXIubmFtZSl9Puino+WwgTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAge2lzQWRtaW4gJiYgKFxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIm1lc3NhZ2UtYWRtaW4tYnV0dG9uXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRTaG93T25saW5lTWVudShmYWxzZSk7XG4gICAgICAgICAgICAgICAgc2V0U2hvd0JsYWNrbGlzdE1lbnUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIG9wZW5BZG1pbigpO1xuICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICDmtojmga/nrqHnkIZcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJwcm9maWxlLWJ1dHRvblwiIHR5cGU9XCJidXR0b25cIiBkaXNhYmxlZD17aXNCYW5uZWQgfHwgIWFjY291bnRWZXJpZmllZH0gb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBzZXROYW1lRHJhZnQobmFtZSk7XG4gICAgICAgICAgICAgIHNldE5hbWVFcnJvcihcIlwiKTtcbiAgICAgICAgICAgICAgc2V0U2hvd05hbWVFZGl0b3IodHJ1ZSk7XG4gICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgYXZhdGFyIHNtYWxsLWF2YXRhciB0b25lLSR7Z2V0QXZhdGFyVG9uZSh1c2VySWQpfWB9Pntpbml0aWFsc308L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInByb2ZpbGUtbmFtZVwiPntuYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiY2hldnJvblwiPuKMhDwvc3Bhbj5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2hlYWRlcj5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1lc3NhZ2UtbGlzdFwiIHJlZj17bGlzdFJlZn0gYXJpYS1saXZlPVwicG9saXRlXCI+XG4gICAgICAgICAge21lc3NhZ2VzTG9hZGluZyA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibG9hZGluZy1zdGF0ZVwiPuato+WcqOWKoOi9vea2iOaBr+KApjwvZGl2PlxuICAgICAgICAgICkgOiBtZXNzYWdlcy5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImVtcHR5LXN0YXRlXCI+6L+Y5rKh5pyJ5raI5oGv77yM5byA5aeL6IGK5aSp5ZCn44CCPC9kaXY+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIG1lc3NhZ2VzLm1hcCgobWVzc2FnZSkgPT4gKFxuICAgICAgICAgICAgICA8YXJ0aWNsZSBjbGFzc05hbWU9e2BtZXNzYWdlLXJvdyAke21lc3NhZ2UudXNlcklkID09PSB1c2VySWQgPyBcIm1pbmVcIiA6IFwiXCJ9YH0ga2V5PXttZXNzYWdlLmlkfT5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2BhdmF0YXIgdG9uZS0ke2dldEF2YXRhclRvbmUobWVzc2FnZS51c2VySWQpfWB9PntnZXRJbml0aWFscyhtZXNzYWdlLm5hbWUpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1lc3NhZ2UtY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtZXNzYWdlLW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz57bWVzc2FnZS51c2VySWQgPT09IHVzZXJJZCA/IFwi5L2gXCIgOiBtZXNzYWdlLm5hbWV9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgIDx0aW1lPntmb3JtYXRUaW1lKG1lc3NhZ2UuY3JlYXRlZEF0KX08L3RpbWU+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxwPnttZXNzYWdlLnRleHR9PC9wPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2FydGljbGU+XG4gICAgICAgICAgICApKVxuICAgICAgICAgICl9XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29tcG9zZXItd3JhcFwiPlxuICAgICAgICAgIHtpc0Jhbm5lZCA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmFuLW5vdGljZVwiPlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxzdHJvbmc+5L2g5bey6KKr566h55CG5ZGY5bCB56aBPC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgPHNwYW4+6K+36IGU57O7566h55CG5ZGY6Kej5bCB44CCPC9zcGFuPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ1bmJhbi1yZXF1ZXN0LWJ1dHRvblwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtyZXF1ZXN0VW5iYW59IGRpc2FibGVkPXtoYXNSZXF1ZXN0ZWRVbmJhbn0+XG4gICAgICAgICAgICAgICAge2hhc1JlcXVlc3RlZFVuYmFuID8gXCLlt7LnlLPor7fop6PlsIFcIiA6IFwi55Sz6K+36Kej5bCBXCJ9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICA8Zm9ybSBjbGFzc05hbWU9XCJjb21wb3NlclwiIG9uU3VibWl0PXtzZW5kTWVzc2FnZX0+XG4gICAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIui+k+WFpea2iOaBr1wiXG4gICAgICAgICAgICAgIHZhbHVlPXtkcmFmdH1cbiAgICAgICAgICAgICAgbWF4TGVuZ3RoPXsyMDAwfVxuICAgICAgICAgICAgICBkaXNhYmxlZD17IWFjY291bnRWZXJpZmllZH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RHJhZnQoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgb25LZXlEb3duPXtoYW5kbGVDb21wb3NlcktleURvd259XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXthY2NvdW50VmVyaWZpZWQgPyBcIuWGmeS4i+S9oOeahOa2iOaBr+KAplwiIDogXCLmraPlnKjpqozor4HotKbmiLfigKZcIn1cbiAgICAgICAgICAgICAgcm93cz17MX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbXBvc2VyLWFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiY29tcG9zZXItaGludFwiPkVudGVyIOWPkemAgSDCtyBTaGlmdCArIEVudGVyIOaNouihjDwvc3Bhbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJzZW5kLWJ1dHRvblwiIHR5cGU9XCJzdWJtaXRcIiBkaXNhYmxlZD17IWRyYWZ0LnRyaW0oKSB8fCBzZW5kaW5nIHx8ICFhY2NvdW50VmVyaWZpZWR9IGFyaWEtbGFiZWw9XCLlj5HpgIHmtojmga9cIj5cbiAgICAgICAgICAgICAgICB7c2VuZGluZyA/IFwi4oCmXCIgOiBcIuWPkemAgVwifVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICApfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29tcG9zZXItZm9vdGVyXCI+XG4gICAgICAgICAgICA8c3Bhbj7mnIDlpJogMjAwMCDkuKrlrZfnrKY8L3NwYW4+XG4gICAgICAgICAgICA8c3Bhbj57ZHJhZnQubGVuZ3RofS8yMDAwPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAge3Nob3dOYW1lRWRpdG9yICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtb2RhbC1iYWNrZHJvcFwiIHJvbGU9XCJwcmVzZW50YXRpb25cIiBvbk1vdXNlRG93bj17KCkgPT4gc2V0U2hvd05hbWVFZGl0b3IoZmFsc2UpfT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm5hbWUtbW9kYWxcIiByb2xlPVwiZGlhbG9nXCIgYXJpYS1tb2RhbD1cInRydWVcIiBhcmlhLWxhYmVsbGVkYnk9XCJuYW1lLXRpdGxlXCIgb25Nb3VzZURvd249eyhldmVudCkgPT4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCl9PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtb2RhbC1pY29uXCI+4pymPC9kaXY+XG4gICAgICAgICAgICA8aDIgaWQ9XCJuYW1lLXRpdGxlXCI+5o2i5Liq5ZCN5a2XPC9oMj5cbiAgICAgICAgICAgIDxwPui/meS4quWQjeWtl+S8muaYvuekuuWcqOS9oOWPkeWHuueahOa2iOaBr+aXgei+ueOAgjwvcD5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBhdXRvRm9jdXNcbiAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIuS9oOeahOWQjeWtl1wiXG4gICAgICAgICAgICAgIHZhbHVlPXtuYW1lRHJhZnR9XG4gICAgICAgICAgICAgIG1heExlbmd0aD17MjB9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0TmFtZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoIW5leHROYW1lLnRyaW0oKSkge1xuICAgICAgICAgICAgICAgICAgc2V0TmFtZURyYWZ0KG5hbWUpO1xuICAgICAgICAgICAgICAgICAgc2V0TmFtZUVycm9yKFwi5ZCN56ew5LiN6IO95Li656m677yM5bey5oGi5aSN5Li65b2T5YmN5ZCN56ewXCIpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXROYW1lRHJhZnQobmV4dE5hbWUpO1xuICAgICAgICAgICAgICAgIHNldE5hbWVFcnJvcihcIlwiKTtcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgb25LZXlEb3duPXsoZXZlbnQpID0+IGV2ZW50LmtleSA9PT0gXCJFbnRlclwiICYmIHZvaWQgc2F2ZU5hbWUoKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm5hbWUtcnVsZXNcIj7lkI3np7DkuI3og73ph43lpI0gwrcg5q+PIDUg5YiG6ZKf5pyA5aSa5L+u5pS55LiA5qyhPC9kaXY+XG4gICAgICAgICAgICB7bmFtZUVycm9yICYmIDxkaXYgY2xhc3NOYW1lPVwibmFtZS1lcnJvclwiIHJvbGU9XCJhbGVydFwiPntuYW1lRXJyb3J9PC9kaXY+fVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtb2RhbC1hY3Rpb25zXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiY2FuY2VsLWJ1dHRvblwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRTaG93TmFtZUVkaXRvcihmYWxzZSl9PuWPlua2iDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cInNhdmUtYnV0dG9uXCIgdHlwZT1cImJ1dHRvblwiIGRpc2FibGVkPXtzYXZpbmdOYW1lIHx8ICFuYW1lRHJhZnQudHJpbSgpfSBvbkNsaWNrPXsoKSA9PiB2b2lkIHNhdmVOYW1lKCl9PntzYXZpbmdOYW1lID8gXCLkv53lrZjkuK3igKZcIiA6IFwi5L+d5a2YXCJ9PC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuXG4gICAgICB7c2hvd0FkbWluICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtb2RhbC1iYWNrZHJvcFwiIHJvbGU9XCJwcmVzZW50YXRpb25cIiBvbk1vdXNlRG93bj17KCkgPT4gc2V0U2hvd0FkbWluKGZhbHNlKX0+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZG1pbi1tb2RhbFwiIHJvbGU9XCJkaWFsb2dcIiBhcmlhLW1vZGFsPVwidHJ1ZVwiIGFyaWEtbGFiZWxsZWRieT1cImFkbWluLXRpdGxlXCIgb25Nb3VzZURvd249eyhldmVudCkgPT4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCl9PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZG1pbi1tb2RhbC1oZWFkZXJcIj5cbiAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImV5ZWJyb3dcIj7ku4XpmZDmnKzmnLo8L2Rpdj5cbiAgICAgICAgICAgICAgICA8aDIgaWQ9XCJhZG1pbi10aXRsZVwiPueuoeeQhuWRmOaOp+WItuWPsDwvaDI+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImNsb3NlLWJ1dHRvblwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRTaG93QWRtaW4oZmFsc2UpfSBhcmlhLWxhYmVsPVwi5YWz6Zet566h55CG6Z2i5p2/XCI+w5c8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZG1pbi10b29sYmFyXCI+XG4gICAgICAgICAgICAgIDxzcGFuPnthZG1pbk1lc3NhZ2VzLmxlbmd0aH0g5p2h5raI5oGvPC9zcGFuPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImNsZWFyLWJ1dHRvblwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtjbGVhckFsbE1lc3NhZ2VzfSBkaXNhYmxlZD17IWFkbWluTWVzc2FnZXMubGVuZ3RofT7muIXnqbrmtojmga88L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAge2FkbWluTG9hZGluZyA/IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZG1pbi1lbXB0eVwiPuato+WcqOivu+WPlueuoeeQhuaVsOaNruKApjwvZGl2PlxuICAgICAgICAgICAgKSA6IGFkbWluTWVzc2FnZXMubGVuZ3RoID09PSAwID8gKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFkbWluLWVtcHR5XCI+5b2T5YmN5rKh5pyJ5raI5oGv44CCPC9kaXY+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFkbWluLW1lc3NhZ2UtbGlzdFwiPlxuICAgICAgICAgICAgICAgIHthZG1pbk1lc3NhZ2VzLm1hcCgobWVzc2FnZSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFkbWluLW1lc3NhZ2VcIiBrZXk9e21lc3NhZ2UuaWR9PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWRtaW4tbWVzc2FnZS1tYWluXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFkbWluLW1lc3NhZ2UtbWV0YVwiPjxzdHJvbmc+e21lc3NhZ2UubmFtZX08L3N0cm9uZz48c3Bhbj57bWVzc2FnZS5pcEFkZHJlc3N9PC9zcGFuPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+e21lc3NhZ2UudGV4dH08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAge21lc3NhZ2UuaXBBZGRyZXNzICE9PSBcInN5c3RlbVwiICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWRtaW4tbWVzc2FnZS1hY3Rpb25zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IGRlbGV0ZUFkbWluTWVzc2FnZShtZXNzYWdlLmlkKX0+5Yig6ZmkPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cblxuICAgICAge2lzQWRtaW4gJiYgdW5iYW5Ob3RpY2VzLmxlbmd0aCA+IDAgJiYgKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInVuYmFuLW5vdGljZXNcIiBhcmlhLWxpdmU9XCJwb2xpdGVcIj5cbiAgICAgICAgICB7dW5iYW5Ob3RpY2VzLm1hcCgobm90aWNlKSA9PiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInVuYmFuLW5vdGljZVwiIGtleT17bm90aWNlLmJsb2NrS2V5fT5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidW5iYW4tbm90aWNlLW1hcmtcIj4hPC9zcGFuPlxuICAgICAgICAgICAgICA8c3Bhbj48c3Ryb25nPntub3RpY2UubmFtZX08L3N0cm9uZz4g5oOz55Sz6K+36Kej5bCBPC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cblxuICAgICAge3N0b3JhZ2VCbG9ja2VkICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzdG9yYWdlLWdhdGVcIiByb2xlPVwiYWxlcnRkaWFsb2dcIiBhcmlhLW1vZGFsPVwidHJ1ZVwiIGFyaWEtbGFiZWxsZWRieT1cInN0b3JhZ2UtZ2F0ZS10aXRsZVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3RvcmFnZS1nYXRlLWNhcmRcIj5cbiAgICAgICAgICAgIDxzcGFuPumakOengeaooeW8j+S4jeWPr+eUqDwvc3Bhbj5cbiAgICAgICAgICAgIDxoMiBpZD1cInN0b3JhZ2UtZ2F0ZS10aXRsZVwiPuivt+mAgOWHuuaXoOeXlS/pmpDnp4HmtY/op4g8L2gyPlxuICAgICAgICAgICAgPHA+6IGK5aSp5a6k6ZyA6KaB5rWP6KeI5Zmo5oyB5LmF5L+d5a2Y6K6/5a6i6Lqr5Lu944CC6K+35L2/55So5pmu6YCa56qX5Y+j5omT5byA5q2k6aG16Z2i77yM54S25ZCO5Yi35paw6YeN6K+V44CCPC9wPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpfT7liLfmlrDph43or5U8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuXG4gICAgICB7ZW50cnlCbG9ja2VkICYmICFzdG9yYWdlQmxvY2tlZCAmJiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3RvcmFnZS1nYXRlXCIgcm9sZT1cImFsZXJ0ZGlhbG9nXCIgYXJpYS1tb2RhbD1cInRydWVcIiBhcmlhLWxhYmVsbGVkYnk9XCJhY2NvdW50LWdhdGUtdGl0bGVcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInN0b3JhZ2UtZ2F0ZS1jYXJkXCI+XG4gICAgICAgICAgICA8c3Bhbj7ml6Dms5Xov5vlhaXogYrlpKnlrqQ8L3NwYW4+XG4gICAgICAgICAgICA8aDIgaWQ9XCJhY2NvdW50LWdhdGUtdGl0bGVcIj7mraQgSVAg5bey5pyJ6LSm5oi3PC9oMj5cbiAgICAgICAgICAgIDxwPntlbnRyeUJsb2NrZWR944CC5peg55eV56qX5Y+j5ZKM5paw55qE5rWP6KeI5Zmo6LSm5oi35LiN6IO95YaN5qyh55m76K6w44CCPC9wPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpfT7kvb/nlKjljp/mtY/op4jlmajlkI7ph43or5U8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuICAgIDwvbWFpbj5cbiAgKTtcbn1cbiJdfQ==