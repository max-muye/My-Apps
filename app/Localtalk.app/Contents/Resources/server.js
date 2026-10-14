const http = require("http");
const os = require("os");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const DATA_DIR = path.join(os.homedir(), "Library", "Application Support", "Localtalk", "data");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
const messages = [];
const talkClients = new Set();
const adminClients = new Set();
const devices = new Map();
const bannedDevices = new Set();
const settings = { allowNewDevices: true };
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
loadMessages();

function localAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((entry) => entry && entry.family === "IPv4" && !entry.internal)
    .map((entry) => entry.address);
}

function isLocalhost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 16 * 1024 * 1024) {
        req.destroy();
        reject(new Error("Request is too large."));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function loadMessages() {
  try {
    const saved = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf8"));
    if (Array.isArray(saved)) messages.push(...saved.slice(-200));
  } catch {}
}

function saveMessages() {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

function sendJson(res, status, data) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function sendEvent(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function broadcast(event, data) {
  for (const client of talkClients) sendEvent(client.res, event, data);
  for (const client of adminClients) sendEvent(client, event, data);
}

function onlineCount() {
  return new Set(Array.from(talkClients, (client) => client.deviceId)).size;
}

function broadcastOnline() {
  const data = { count: onlineCount() };
  for (const client of talkClients) sendEvent(client.res, "online", data);
  for (const client of adminClients) sendEvent(client, "refresh", adminState());
}

function publicMessage(message) {
  return {
    id: message.id,
    deviceId: message.deviceId,
    name: message.name,
    text: message.text,
    quote: message.quote || null,
    file: message.file || null,
    time: message.time
  };
}

function safeFileName(name) {
  const cleaned = String(name || "file").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  return cleaned || "file";
}

function saveUpload(file) {
  if (!file || !file.data) return null;
  const buffer = Buffer.from(String(file.data), "base64");
  if (buffer.length > 10 * 1024 * 1024) throw new Error("File is too large. Max size is 10 MB.");
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const storedName = `${id}-${safeFileName(file.name)}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, storedName), buffer);
  return {
    name: safeFileName(file.name),
    type: String(file.type || "application/octet-stream").slice(0, 120),
    size: buffer.length,
    url: `/uploads/${encodeURIComponent(storedName)}`
  };
}

function quoteFrom(input) {
  if (!input || !input.id) return null;
  return {
    id: String(input.id).slice(0, 80),
    name: String(input.name || "Someone").slice(0, 24),
    text: String(input.text || "").slice(0, 160)
  };
}

function adminState() {
  return {
    messages: messages.map(publicMessage),
    devices: Array.from(devices.values()).sort((a, b) => b.lastSeen.localeCompare(a.lastSeen)),
    bannedDevices: Array.from(bannedDevices),
    settings,
    onlineCount: onlineCount(),
    urls: {
      admin: `http://localhost:${PORT}`,
      talk: localAddresses().map((address) => `http://${address}:${PORT}`)
    }
  };
}

function rememberDevice(deviceId, name, req) {
  const now = new Date().toISOString();
  const existing = devices.get(deviceId);
  const device = {
    id: deviceId,
    name: String(name || existing?.name || "Someone").trim().slice(0, 24) || "Someone",
    firstSeen: existing?.firstSeen || now,
    lastSeen: now,
    ip: req.socket.remoteAddress || "",
    userAgent: req.headers["user-agent"] || "",
    banned: bannedDevices.has(deviceId)
  };
  devices.set(deviceId, device);
  return device;
}

function accessFor(deviceId) {
  if (!deviceId) return { ok: false, reason: "Missing device ID." };
  if (bannedDevices.has(deviceId)) return { ok: false, reason: "This device is banned." };
  if (!settings.allowNewDevices && !devices.has(deviceId)) {
    return { ok: false, reason: "New or private-window devices are blocked by the admin." };
  }
  return { ok: true };
}

function baseStyles() {
  return `<style>
    :root {
      color-scheme: light dark;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #101418;
      color: #f5f2eb;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(circle at 16% 8%, rgba(69, 156, 133, 0.24), transparent 26rem),
        linear-gradient(135deg, #101418 0%, #171b1f 52%, #241b1f 100%);
    }
    button, input {
      min-height: 40px;
      border-radius: 8px;
      border: 1px solid rgba(245, 242, 235, 0.18);
      font: inherit;
    }
    input {
      min-width: 0;
      padding: 0 12px;
      background: rgba(245, 242, 235, 0.1);
      color: #f5f2eb;
    }
    button {
      padding: 0 14px;
      background: #e2bb68;
      color: #17120b;
      font-weight: 700;
      cursor: pointer;
    }
    button.danger { background: #e06f5f; color: #180d0b; }
    button.secondary { background: rgba(245, 242, 235, 0.1); color: #f5f2eb; }
    .muted { color: rgba(245, 242, 235, 0.62); }
    .meta { color: #a8cfc2; font-size: 12px; }
    a { color: #a8cfc2; }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .brand img {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      flex: 0 0 auto;
    }
    .slowLink {
      display: inline-flex;
      align-items: center;
      min-height: 34px;
      padding: 0 10px;
      border: 1px solid rgba(168, 207, 194, 0.3);
      border-radius: 8px;
      background: rgba(168, 207, 194, 0.1);
      color: #a8cfc2;
      text-decoration: none;
      font-size: 13px;
      font-weight: 700;
      white-space: nowrap;
    }
  </style>`;
}

function chatPage() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Localtalk</title>
  <link rel="icon" href="/assets/localtalk-logo.png">
  <link rel="apple-touch-icon" href="/assets/localtalk-logo.png">
  ${baseStyles()}
  <style>
    body { display: grid; grid-template-rows: auto 1fr auto; }
    header, form {
      padding: 14px;
      background: rgba(16, 20, 24, 0.82);
      border-color: rgba(245, 242, 235, 0.12);
      backdrop-filter: blur(18px);
    }
    header {
      border-bottom: 1px solid rgba(245, 242, 235, 0.12);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    h1 { margin: 0; font-size: 18px; letter-spacing: 0; }
    main {
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .empty, .blocked {
      margin: auto;
      color: rgba(245, 242, 235, 0.62);
      text-align: center;
      max-width: 28rem;
      line-height: 1.45;
    }
    .message {
      max-width: min(45rem, 88vw);
      padding: 10px 12px;
      border: 1px solid rgba(245, 242, 235, 0.14);
      border-radius: 8px;
      background: rgba(245, 242, 235, 0.08);
      line-height: 1.35;
      overflow-wrap: anywhere;
    }
    .quote {
      margin-bottom: 8px;
      padding: 8px;
      border-left: 3px solid #e2bb68;
      background: rgba(226, 187, 104, 0.12);
      color: rgba(245, 242, 235, 0.78);
    }
    .file {
      display: inline-block;
      margin-top: 8px;
      padding: 7px 9px;
      border-radius: 8px;
      background: rgba(168, 207, 194, 0.12);
    }
    .tools {
      margin-top: 8px;
      display: flex;
      gap: 8px;
    }
    .quoteBar {
      grid-column: 1 / -1;
      display: none;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 8px;
      border-radius: 8px;
      background: rgba(226, 187, 104, 0.12);
    }
    .fileInput {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      opacity: 0;
      pointer-events: none;
    }
    .attach {
      min-height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0 12px;
      border-radius: 8px;
      border: 1px solid rgba(245, 242, 235, 0.18);
      background: rgba(245, 242, 235, 0.1);
      color: #f5f2eb;
      cursor: pointer;
      white-space: nowrap;
    }
    .fileName {
      min-width: 0;
      align-self: center;
      color: rgba(245, 242, 235, 0.62);
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    form {
      border-top: 1px solid rgba(245, 242, 235, 0.12);
      display: grid;
      grid-template-columns: minmax(7rem, 11rem) 1fr auto minmax(6rem, 12rem) auto;
      gap: 8px;
    }
    @media (max-width: 640px) {
      form { grid-template-columns: 1fr auto; }
      #name { grid-column: 1 / -1; }
      #text { grid-column: 1 / -1; }
      .fileName { display: none; }
      header { align-items: flex-start; flex-direction: column; }
    }
  </style>
</head>
<body>
  <header>
    <div class="brand"><img src="/assets/localtalk-logo.png" alt=""><h1>Localtalk</h1></div>
    <a class="slowLink" href="https://www.muye.dev/talk" target="_blank" rel="noopener">Anytime web page</a>
    <div class="meta" id="status">Connecting...</div>
  </header>
  <main id="messages">
    <div class="empty" id="empty">Start talking on this local network page.</div>
  </main>
  <form id="form">
    <div class="quoteBar" id="quoteBar"><span id="quoteText"></span><button type="button" class="secondary" id="clearQuote">Clear</button></div>
    <input id="name" autocomplete="name" maxlength="24" placeholder="Name">
    <input id="text" autocomplete="off" maxlength="1024" placeholder="Message" autofocus>
    <label class="attach" for="file">Attach</label>
    <input class="fileInput" id="file" type="file">
    <div class="fileName" id="fileName">No file</div>
    <button type="submit">Send</button>
  </form>
  <script>
    const messages = document.getElementById("messages");
    const empty = document.getElementById("empty");
    const status = document.getElementById("status");
    const form = document.getElementById("form");
    const nameInput = document.getElementById("name");
    const textInput = document.getElementById("text");
    const fileInput = document.getElementById("file");
    const fileName = document.getElementById("fileName");
    const quoteBar = document.getElementById("quoteBar");
    const quoteText = document.getElementById("quoteText");
    const clearQuote = document.getElementById("clearQuote");
    let activeQuote = null;

    function makeId() {
      return "dev-" + Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
    }

    const deviceId = localStorage.getItem("localtalk.deviceId") || makeId();
    localStorage.setItem("localtalk.deviceId", deviceId);
    nameInput.value = localStorage.getItem("localtalk.name") || "";

    function block(reason) {
      form.hidden = true;
      messages.innerHTML = '<div class="blocked"><h2>Not allowed in</h2><p></p><p class="meta"></p></div>';
      messages.querySelector("p").textContent = reason;
      messages.querySelector(".meta").textContent = "Device ID: " + deviceId;
      status.textContent = "Blocked";
    }

    function addMessage(message) {
      empty.hidden = true;
      const node = document.createElement("article");
      node.className = "message";
      node.dataset.id = message.id;
      const time = new Date(message.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      node.innerHTML = '<div class="meta"></div><div class="quote" hidden></div><div class="text"></div><div class="fileWrap"></div><div class="tools"><button type="button" class="secondary">Quote</button></div>';
      node.querySelector(".meta").textContent = message.name + " - " + time;
      if (message.quote) {
        node.querySelector(".quote").hidden = false;
        node.querySelector(".quote").textContent = message.quote.name + ": " + message.quote.text;
      }
      renderMessage(node.querySelector(".text"), message.text);
      if (message.file) {
        const link = document.createElement("a");
        link.className = "file";
        link.href = message.file.url;
        link.download = message.file.name;
        link.textContent = "File: " + message.file.name;
        node.querySelector(".fileWrap").appendChild(link);
      }
      node.querySelector("button").onclick = () => setQuote(message);
      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "secondary";
      copyButton.textContent = "Copy";
      copyButton.onclick = () => copyMessage(message, copyButton);
      node.querySelector(".tools").appendChild(copyButton);
      if (message.deviceId === deviceId) {
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "danger";
        deleteButton.textContent = "Delete";
        deleteButton.onclick = async () => {
          const response = await fetch("/messages/" + encodeURIComponent(message.id) + "?deviceId=" + encodeURIComponent(deviceId), { method: "DELETE" });
          if (!response.ok) status.textContent = "Could not delete message.";
        };
        node.querySelector(".tools").appendChild(deleteButton);
      }
      messages.appendChild(node);
      messages.scrollTop = messages.scrollHeight;
    }

    async function copyMessage(message, button) {
      const value = String(message.text || (message.file ? "File: " + message.file.name : ""));
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        const area = document.createElement("textarea");
        area.value = value;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      button.textContent = "Copied";
      setTimeout(() => { button.textContent = "Copy"; }, 1400);
    }

    function setQuote(message) {
      activeQuote = { id: message.id, name: message.name, text: String(message.text || "").slice(0, 160) };
      quoteText.textContent = activeQuote.name + ": " + activeQuote.text;
      quoteBar.style.display = "flex";
      textInput.focus();
    }

    clearQuote.onclick = () => {
      activeQuote = null;
      quoteBar.style.display = "none";
    };

    fileInput.onchange = () => {
      fileName.textContent = fileInput.files[0] ? fileInput.files[0].name : "No file";
    };

    function readFile(file) {
      return new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => resolve({
          name: file.name,
          type: file.type || "application/octet-stream",
          data: String(reader.result).split(",")[1] || ""
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    function renderMessage(target, text) {
      target.replaceChildren();
      String(text).replace(/\\\\n/g, "\\n").split("\\n").forEach((line, lineIndex) => {
        if (lineIndex) target.appendChild(document.createElement("br"));
        line.split(/(\\*\\*[^*]+\\*\\*)/g).forEach((part) => {
          if (!part) return;
          const isBold = part.startsWith("**") && part.endsWith("**") && part.length > 4;
          const node = document.createElement(isBold ? "strong" : "span");
          node.textContent = isBold ? part.slice(2, -2) : part;
          target.appendChild(node);
        });
      });
    }

    function removeMessage(id) {
      const node = messages.querySelector('[data-id="' + CSS.escape(id) + '"]');
      if (node) node.remove();
      empty.hidden = messages.querySelectorAll(".message").length > 0;
    }

    async function hello() {
      const res = await fetch("/api/hello", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ deviceId, name: nameInput.value })
      });
      const data = await res.json();
      if (!data.ok) block(data.reason || "This device is blocked.");
      return data.ok;
    }

    hello().then((ok) => {
      if (!ok) return;
      fetch("/messages?deviceId=" + encodeURIComponent(deviceId))
        .then((res) => res.json())
        .then((history) => history.forEach(addMessage))
        .catch(() => {});

      const stream = new EventSource("/events?deviceId=" + encodeURIComponent(deviceId));
      stream.addEventListener("open", () => { status.textContent = "Live - 1 online"; });
      stream.addEventListener("online", (event) => {
        const data = JSON.parse(event.data);
        status.textContent = "Live - " + data.count + " online";
      });
      stream.addEventListener("message", (event) => addMessage(JSON.parse(event.data)));
      stream.addEventListener("delete", (event) => removeMessage(JSON.parse(event.data).id));
      stream.addEventListener("blocked", (event) => {
        const data = JSON.parse(event.data);
        if (data.deviceId === deviceId) block(data.reason);
      });
      stream.addEventListener("error", () => { status.textContent = "Reconnecting..."; });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = nameInput.value.trim() || "Someone";
      const text = textInput.value.trim();
      if (!text && !fileInput.files[0]) return;
      localStorage.setItem("localtalk.name", name);
      textInput.value = "";
      const file = await readFile(fileInput.files[0]);
      fileInput.value = "";
      fileName.textContent = "No file";
      const res = await fetch("/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ deviceId, name, text, file, quote: activeQuote })
      });
      activeQuote = null;
      quoteBar.style.display = "none";
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        block(data.reason || data.error || "Message was blocked.");
      }
    });
  </script>
</body>
</html>`;
}

function adminPage() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Localtalk Admin</title>
  <link rel="icon" href="/assets/localtalk-logo.png">
  <link rel="apple-touch-icon" href="/assets/localtalk-logo.png">
  ${baseStyles()}
  <style>
    body { padding: 18px; }
    .wrap { max-width: 1080px; margin: 0 auto; display: grid; gap: 16px; }
    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(245, 242, 235, 0.12);
    }
    h1, h2 { margin: 0; letter-spacing: 0; }
    h1 { font-size: 24px; }
    h2 { font-size: 16px; }
    section {
      display: grid;
      gap: 10px;
      padding: 12px 0;
      border-bottom: 1px solid rgba(245, 242, 235, 0.12);
    }
    .device, .message {
      display: grid;
      gap: 8px;
      align-items: center;
      grid-template-columns: 1fr auto auto;
      padding: 10px;
      border-radius: 8px;
      background: rgba(245, 242, 235, 0.08);
      border: 1px solid rgba(245, 242, 235, 0.12);
    }
    .message { grid-template-columns: 1fr auto; }
    .stack { display: grid; gap: 4px; min-width: 0; }
    .text { overflow-wrap: anywhere; }
    .quote {
      padding: 8px;
      border-left: 3px solid #e2bb68;
      background: rgba(226, 187, 104, 0.12);
      color: rgba(245, 242, 235, 0.78);
    }
    .file {
      width: fit-content;
      padding: 7px 9px;
      border-radius: 8px;
      background: rgba(168, 207, 194, 0.12);
    }
    .links { display: flex; flex-wrap: wrap; gap: 8px; }
    @media (max-width: 720px) {
      body { padding: 12px; }
      header, .device, .message { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div>
        <div class="brand"><img src="/assets/localtalk-logo.png" alt=""><h1>Localtalk Admin</h1></div>
        <div class="meta">Localhost is admin. IPv4 is talk.</div>
      </div>
      <button id="toggleNew"></button>
    </header>
    <section>
      <h2>Pages</h2>
      <a class="slowLink" href="https://www.muye.dev/talk" target="_blank" rel="noopener">Anytime web page</a>
      <div class="links" id="links"></div>
    </section>
    <section>
      <h2>Messages</h2>
      <div id="messageList" class="stack"></div>
    </section>
    <section>
      <h2>Devices</h2>
      <div id="deviceList" class="stack"></div>
    </section>
  </div>
  <script>
    const messageList = document.getElementById("messageList");
    const deviceList = document.getElementById("deviceList");
    const links = document.getElementById("links");
    const toggleNew = document.getElementById("toggleNew");

    function small(value) {
      return value ? String(value).slice(0, 90) : "";
    }

    function renderMessage(target, text) {
      target.replaceChildren();
      String(text).replace(/\\\\n/g, "\\n").split("\\n").forEach((line, lineIndex) => {
        if (lineIndex) target.appendChild(document.createElement("br"));
        line.split(/(\\*\\*[^*]+\\*\\*)/g).forEach((part) => {
          if (!part) return;
          const isBold = part.startsWith("**") && part.endsWith("**") && part.length > 4;
          const node = document.createElement(isBold ? "strong" : "span");
          node.textContent = isBold ? part.slice(2, -2) : part;
          target.appendChild(node);
        });
      });
    }

    function draw(state) {
      toggleNew.textContent = state.settings.allowNewDevices ? "Block New/Private Devices" : "Allow New/Private Devices";
      toggleNew.className = state.settings.allowNewDevices ? "danger" : "";
      links.innerHTML = "";
      [state.urls.admin].concat(state.urls.talk).forEach((url) => {
        const a = document.createElement("a");
        a.href = url;
        a.textContent = url;
        a.onclick = (event) => {
          event.preventDefault();
          const popup = window.open(url, "localtalk_page", "popup=yes,width=430,height=760,menubar=no,toolbar=no,location=yes,status=no,scrollbars=yes,resizable=yes");
          if (!popup) window.open(url, "_blank");
        };
        links.appendChild(a);
      });

      messageList.innerHTML = state.messages.length ? "" : '<div class="muted">No messages yet.</div>';
      state.messages.slice().reverse().forEach((message) => {
        const node = document.createElement("div");
        node.className = "message";
        node.innerHTML = '<div class="stack"><div class="meta"></div><div class="quote" hidden></div><div class="text"></div><div class="fileWrap"></div><div class="meta"></div></div><button class="danger">Delete</button>';
        node.querySelector(".meta").textContent = message.name + " - " + new Date(message.time).toLocaleString();
        if (message.quote) {
          node.querySelector(".quote").hidden = false;
          node.querySelector(".quote").textContent = message.quote.name + ": " + message.quote.text;
        }
        renderMessage(node.querySelector(".text"), message.text);
        if (message.file) {
          const link = document.createElement("a");
          link.className = "file";
          link.href = message.file.url;
          link.download = message.file.name;
          link.textContent = "File: " + message.file.name;
          node.querySelector(".fileWrap").appendChild(link);
        }
        node.querySelectorAll(".meta")[1].textContent = "Device ID: " + message.deviceId;
        node.querySelector("button").onclick = () => fetch("/admin/messages/" + encodeURIComponent(message.id), { method: "DELETE" }).then(load);
        messageList.appendChild(node);
      });

      deviceList.innerHTML = state.devices.length ? "" : '<div class="muted">No devices yet.</div>';
      state.devices.forEach((device) => {
        const node = document.createElement("div");
        node.className = "device";
        const isBanned = state.bannedDevices.includes(device.id);
        node.innerHTML = '<div class="stack"><strong></strong><div class="meta"></div><div class="meta"></div></div><button></button><button class="secondary">Copy ID</button>';
        node.querySelector("strong").textContent = device.name + (isBanned ? " (banned)" : "");
        node.querySelectorAll(".meta")[0].textContent = "Device ID: " + device.id;
        node.querySelectorAll(".meta")[1].textContent = "IP: " + small(device.ip) + " - Last seen: " + new Date(device.lastSeen).toLocaleString();
        node.querySelector("button").textContent = isBanned ? "Unban" : "Ban";
        node.querySelector("button").className = isBanned ? "" : "danger";
        node.querySelector("button").onclick = () => fetch("/admin/devices/" + encodeURIComponent(device.id) + "/ban", {
          method: isBanned ? "DELETE" : "POST"
        }).then(load);
        node.querySelectorAll("button")[1].onclick = () => navigator.clipboard?.writeText(device.id);
        deviceList.appendChild(node);
      });
    }

    async function load() {
      const state = await fetch("/admin/state").then((res) => res.json());
      draw(state);
    }

    toggleNew.onclick = async () => {
      const state = await fetch("/admin/state").then((res) => res.json());
      await fetch("/admin/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ allowNewDevices: !state.settings.allowNewDevices })
      });
      load();
    };

    const stream = new EventSource("/admin/events");
    stream.addEventListener("refresh", load);
    load();
  </script>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  try {
    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(isLocalhost(url.hostname) ? adminPage() : chatPage());
      return;
    }

    if (req.method === "GET" && url.pathname.startsWith("/uploads/")) {
      const storedName = path.basename(decodeURIComponent(url.pathname.slice("/uploads/".length)));
      const filePath = path.join(UPLOAD_DIR, storedName);
      if (!filePath.startsWith(UPLOAD_DIR) || !fs.existsSync(filePath)) {
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        res.end("File not found");
        return;
      }
      res.writeHead(200, { "content-type": "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    if (req.method === "GET" && url.pathname.startsWith("/assets/")) {
      const fileName = path.basename(decodeURIComponent(url.pathname.slice("/assets/".length)));
      const filePath = path.join(__dirname, "assets", fileName);
      if (!filePath.startsWith(path.join(__dirname, "assets")) || !fs.existsSync(filePath)) {
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        res.end("Asset not found");
        return;
      }
      res.writeHead(200, { "content-type": "image/png" });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    if (req.method === "GET" && url.pathname === "/admin/state") {
      sendJson(res, 200, adminState());
      return;
    }

    if (req.method === "GET" && url.pathname === "/admin/events") {
      res.writeHead(200, {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive"
      });
      res.write("\n");
      adminClients.add(res);
      req.on("close", () => adminClients.delete(res));
      return;
    }

    if (req.method === "POST" && url.pathname === "/admin/settings") {
      const input = JSON.parse(await readBody(req));
      settings.allowNewDevices = Boolean(input.allowNewDevices);
      broadcast("refresh", adminState());
      sendJson(res, 200, settings);
      return;
    }

    const deleteMessageMatch = url.pathname.match(/^\/admin\/messages\/([^/]+)$/);
    if (req.method === "DELETE" && deleteMessageMatch) {
      const id = decodeURIComponent(deleteMessageMatch[1]);
      const index = messages.findIndex((message) => message.id === id);
      if (index >= 0) messages.splice(index, 1);
      saveMessages();
      broadcast("delete", { id });
      broadcast("refresh", adminState());
      sendJson(res, 200, { ok: true });
      return;
    }

    const banMatch = url.pathname.match(/^\/admin\/devices\/([^/]+)\/ban$/);
    if (banMatch && (req.method === "POST" || req.method === "DELETE")) {
      const deviceId = decodeURIComponent(banMatch[1]);
      if (req.method === "POST") bannedDevices.add(deviceId);
      if (req.method === "DELETE") bannedDevices.delete(deviceId);
      const device = devices.get(deviceId);
      if (device) device.banned = bannedDevices.has(deviceId);
      broadcast("blocked", { deviceId, reason: "This device is banned." });
      broadcast("refresh", adminState());
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/hello") {
      const input = JSON.parse(await readBody(req));
      const deviceId = String(input.deviceId || "").trim().slice(0, 80);
      const access = accessFor(deviceId);
      if (!access.ok) {
        sendJson(res, 403, { ok: false, reason: access.reason });
        return;
      }
      rememberDevice(deviceId, input.name, req);
      broadcast("refresh", adminState());
      sendJson(res, 200, { ok: true, deviceId });
      return;
    }

    if (req.method === "GET" && url.pathname === "/messages") {
      const deviceId = String(url.searchParams.get("deviceId") || "").trim();
      const access = accessFor(deviceId);
      if (!access.ok) {
        sendJson(res, 403, { ok: false, reason: access.reason });
        return;
      }
      sendJson(res, 200, messages.map(publicMessage));
      return;
    }

    if (req.method === "POST" && url.pathname === "/messages") {
      const input = JSON.parse(await readBody(req));
      const deviceId = String(input.deviceId || "").trim().slice(0, 80);
      const access = accessFor(deviceId);
      if (!access.ok) {
        sendJson(res, 403, { ok: false, reason: access.reason });
        return;
      }
      const text = String(input.text || "").trim().slice(0, 1024);
      const file = saveUpload(input.file);
      if (!text && !file) throw new Error("Message is empty.");
      const device = rememberDevice(deviceId, input.name, req);
      const message = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        deviceId,
        name: device.name,
        text,
        quote: quoteFrom(input.quote),
        file,
        time: new Date().toISOString()
      };
      messages.push(message);
      while (messages.length > 200) messages.shift();
      saveMessages();
      broadcast("message", publicMessage(message));
      broadcast("refresh", adminState());
      sendJson(res, 201, publicMessage(message));
      return;
    }

    const ownDeleteMatch = url.pathname.match(/^\/messages\/([^/]+)$/);
    if (req.method === "DELETE" && ownDeleteMatch) {
      const deviceId = String(url.searchParams.get("deviceId") || "").trim();
      const access = accessFor(deviceId);
      if (!access.ok) {
        sendJson(res, 403, { ok: false, reason: access.reason });
        return;
      }
      const id = decodeURIComponent(ownDeleteMatch[1]);
      const index = messages.findIndex((message) => message.id === id && message.deviceId === deviceId);
      if (index < 0) {
        sendJson(res, 404, { ok: false, reason: "Message not found or it belongs to another device." });
        return;
      }
      const [message] = messages.splice(index, 1);
      saveMessages();
      broadcast("delete", { id });
      broadcast("refresh", adminState());
      sendJson(res, 200, { ok: true, id });
      return;
    }

    if (req.method === "GET" && url.pathname === "/events") {
      const deviceId = String(url.searchParams.get("deviceId") || "").trim();
      const access = accessFor(deviceId);
      if (!access.ok) {
        sendJson(res, 403, { ok: false, reason: access.reason });
        return;
      }
      res.writeHead(200, {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive"
      });
      res.write("\n");
      const client = { res, deviceId };
      talkClients.add(client);
      sendEvent(res, "online", { count: onlineCount() });
      broadcastOnline();
      req.on("close", () => {
        talkClients.delete(client);
        broadcastOnline();
      });
      return;
    }

    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  } catch (error) {
    sendJson(res, 400, { ok: false, error: error.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log("Localtalk is running.");
  console.log(`Admin page: http://localhost:${PORT}`);
  for (const address of localAddresses()) console.log(`Talk page: http://${address}:${PORT}`);
  console.log("Control+C to quit");
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log(`Localtalk is already running on port ${PORT}.`);
    console.log(`Admin page: http://localhost:${PORT}`);
    for (const address of localAddresses()) console.log(`Talk page: http://${address}:${PORT}`);
    console.log("Use the page above, or press Control+C in the original Localtalk window to stop it.");
    process.exit(0);
  }
  throw error;
});
