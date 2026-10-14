const state = {
  tabs: [],
  activeTabId: null,
  bookmarks: [],
  settings: {
    homeUrl: "https://www.google.com",
    searchEngine: "https://www.google.com/search?q=%s",
    openExternalLinks: false
  },
  panel: null
};

const elements = {
  tabStrip: document.querySelector("#tabStrip"),
  webviewStack: document.querySelector("#webviewStack"),
  addressForm: document.querySelector("#addressForm"),
  addressInput: document.querySelector("#addressInput"),
  backButton: document.querySelector("#backButton"),
  forwardButton: document.querySelector("#forwardButton"),
  reloadButton: document.querySelector("#reloadButton"),
  homeButton: document.querySelector("#homeButton"),
  bookmarkButton: document.querySelector("#bookmarkButton"),
  bookmarksButton: document.querySelector("#bookmarksButton"),
  downloadsButton: document.querySelector("#downloadsButton"),
  settingsButton: document.querySelector("#settingsButton"),
  newTabButton: document.querySelector("#newTabButton"),
  sidePanel: document.querySelector("#sidePanel")
};

function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function normalizeAddress(input) {
  const value = input.trim();

  if (!value) {
    return state.settings.homeUrl;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    return value;
  }

  if (value.includes(".") && !value.includes(" ")) {
    return `https://${value}`;
  }

  return state.settings.searchEngine.replace("%s", encodeURIComponent(value));
}

function activeTab() {
  return state.tabs.find((tab) => tab.id === state.activeTabId);
}

function isBookmarked(url) {
  return state.bookmarks.some((bookmark) => bookmark.url === url);
}

function renderTabs() {
  elements.tabStrip.replaceChildren();

  state.tabs.forEach((tab) => {
    const template = document.querySelector("#tabTemplate");
    const tabButton = template.content.firstElementChild.cloneNode(true);
    tabButton.dataset.tabId = tab.id;
    tabButton.classList.toggle("active", tab.id === state.activeTabId);
    tabButton.querySelector(".tab-title").textContent = tab.title || "New tab";
    tabButton.querySelector(".tab-loading").hidden = !tab.loading;

    tabButton.addEventListener("click", () => setActiveTab(tab.id));
    tabButton.querySelector(".tab-close").addEventListener("click", (event) => {
      event.stopPropagation();
      closeTab(tab.id);
    });

    elements.tabStrip.append(tabButton);
  });
}

function renderToolbar() {
  const tab = activeTab();
  const webview = tab?.webview;
  const url = tab?.ready ? webview.getURL() : tab?.url || "";

  elements.addressInput.value = url;
  elements.backButton.disabled = !tab?.ready || !webview.canGoBack();
  elements.forwardButton.disabled = !tab?.ready || !webview.canGoForward();
  elements.bookmarkButton.textContent = isBookmarked(url) ? "★" : "☆";
}

function renderPanels() {
  elements.sidePanel.hidden = !state.panel;

  if (state.panel === "bookmarks") {
    elements.sidePanel.innerHTML = `
      <div class="panel-header">
        <h2>Bookmarks</h2>
        <button class="icon-button" data-close-panel aria-label="Close panel">×</button>
      </div>
      <div class="panel-list">
        ${
          state.bookmarks.length
            ? state.bookmarks.map((bookmark) => `
              <button class="panel-row" data-bookmark-url="${escapeHtml(bookmark.url)}">
                <span>${escapeHtml(bookmark.title || bookmark.url)}</span>
                <small>${escapeHtml(bookmark.url)}</small>
              </button>
            `).join("")
            : `<p class="empty-state">No bookmarks yet.</p>`
        }
      </div>
    `;

    elements.sidePanel.querySelectorAll("[data-bookmark-url]").forEach((button) => {
      button.addEventListener("click", () => navigateActiveTab(button.dataset.bookmarkUrl));
    });
  }

  if (state.panel === "downloads") {
    elements.sidePanel.innerHTML = `
      <div class="panel-header">
        <h2>Downloads</h2>
        <button class="icon-button" data-close-panel aria-label="Close panel">×</button>
      </div>
      <p class="empty-state">Download tracking is ready for a native handler in the next pass.</p>
    `;
  }

  if (state.panel === "settings") {
    elements.sidePanel.innerHTML = `
      <div class="panel-header">
        <h2>Settings</h2>
        <button class="icon-button" data-close-panel aria-label="Close panel">×</button>
      </div>
      <form class="settings-form" id="settingsForm">
        <label>
          <span>Home page</span>
          <input name="homeUrl" value="${escapeHtml(state.settings.homeUrl)}" />
        </label>
        <label>
          <span>Search URL</span>
          <input name="searchEngine" value="${escapeHtml(state.settings.searchEngine)}" />
        </label>
        <label class="checkbox-row">
          <input type="checkbox" name="openExternalLinks" ${state.settings.openExternalLinks ? "checked" : ""} />
          <span>Open new-window links externally</span>
        </label>
        <button class="primary-button" type="submit">Save settings</button>
      </form>
    `;

    elements.sidePanel.querySelector("#settingsForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      state.settings = {
        homeUrl: normalizeAddress(form.get("homeUrl")),
        searchEngine: form.get("searchEngine").trim() || state.settings.searchEngine,
        openExternalLinks: form.get("openExternalLinks") === "on"
      };
      await window.browserApi.setSettings(state.settings);
      renderPanels();
    });
  }

  elements.sidePanel.querySelector("[data-close-panel]")?.addEventListener("click", () => {
    state.panel = null;
    renderPanels();
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function render() {
  renderTabs();
  renderToolbar();
  renderPanels();
}

function attachWebviewEvents(tab) {
  tab.webview.addEventListener("dom-ready", () => {
    tab.ready = true;
    tab.url = tab.webview.getURL();
    renderToolbar();
  });

  tab.webview.addEventListener("did-start-loading", () => {
    tab.loading = true;
    render();
  });

  tab.webview.addEventListener("did-stop-loading", () => {
    tab.loading = false;
    tab.url = tab.webview.getURL();
    render();
  });

  tab.webview.addEventListener("page-title-updated", (event) => {
    tab.title = event.title;
    renderTabs();
  });

  tab.webview.addEventListener("did-navigate", () => {
    tab.url = tab.webview.getURL();
    renderToolbar();
  });

  tab.webview.addEventListener("did-navigate-in-page", () => {
    tab.url = tab.webview.getURL();
    renderToolbar();
  });

}

function createTab(url = state.settings.homeUrl) {
  const tab = {
    id: createId(),
    title: "New tab",
    url,
    loading: false,
    ready: false,
    webview: document.createElement("webview")
  };

  tab.webview.src = normalizeAddress(url);
  tab.webview.className = "browser-view";
  tab.webview.dataset.tabId = tab.id;
  elements.webviewStack.append(tab.webview);
  attachWebviewEvents(tab);

  state.tabs.push(tab);
  setActiveTab(tab.id);
}

function setActiveTab(tabId) {
  state.activeTabId = tabId;

  state.tabs.forEach((tab) => {
    tab.webview.classList.toggle("active", tab.id === tabId);
  });

  render();
}

function closeTab(tabId) {
  const index = state.tabs.findIndex((tab) => tab.id === tabId);
  if (index === -1) {
    return;
  }

  const [tab] = state.tabs.splice(index, 1);
  tab.webview.remove();

  if (state.tabs.length === 0) {
    createTab();
    return;
  }

  if (state.activeTabId === tabId) {
    setActiveTab(state.tabs[Math.max(0, index - 1)].id);
  } else {
    render();
  }
}

function navigateActiveTab(url) {
  const tab = activeTab();
  if (!tab) {
    return;
  }

  tab.webview.src = normalizeAddress(url);
  tab.url = tab.webview.src;
  renderToolbar();
}

async function toggleBookmark() {
  const tab = activeTab();
  const url = tab?.ready ? tab.webview.getURL() : tab?.url;

  if (!url) {
    return;
  }

  if (isBookmarked(url)) {
    state.bookmarks = state.bookmarks.filter((bookmark) => bookmark.url !== url);
  } else {
    state.bookmarks = [
      ...state.bookmarks,
      {
        title: tab.title || url,
        url,
        createdAt: new Date().toISOString()
      }
    ];
  }

  await window.browserApi.setBookmarks(state.bookmarks);
  render();
}

function bindEvents() {
  elements.newTabButton.addEventListener("click", () => createTab());
  elements.backButton.addEventListener("click", () => {
    const tab = activeTab();
    if (tab?.ready && tab.webview.canGoBack()) tab.webview.goBack();
  });
  elements.forwardButton.addEventListener("click", () => {
    const tab = activeTab();
    if (tab?.ready && tab.webview.canGoForward()) tab.webview.goForward();
  });
  elements.reloadButton.addEventListener("click", () => {
    const tab = activeTab();
    if (tab?.ready) tab.webview.reload();
  });
  elements.homeButton.addEventListener("click", () => navigateActiveTab(state.settings.homeUrl));
  elements.bookmarkButton.addEventListener("click", toggleBookmark);

  elements.addressForm.addEventListener("submit", (event) => {
    event.preventDefault();
    navigateActiveTab(elements.addressInput.value);
  });

  elements.bookmarksButton.addEventListener("click", () => {
    state.panel = state.panel === "bookmarks" ? null : "bookmarks";
    renderPanels();
  });

  elements.downloadsButton.addEventListener("click", () => {
    state.panel = state.panel === "downloads" ? null : "downloads";
    renderPanels();
  });

  elements.settingsButton.addEventListener("click", () => {
    state.panel = state.panel === "settings" ? null : "settings";
    renderPanels();
  });
}

async function init() {
  const store = await window.browserApi.loadStore();
  state.bookmarks = store.bookmarks || [];
  state.settings = { ...state.settings, ...(store.settings || {}) };
  window.browserApi.onOpenRequest((url) => {
    if (!url || url === "about:blank") {
      return;
    }

    if (state.settings.openExternalLinks) {
      window.browserApi.openExternal(url).catch(console.error);
    } else {
      createTab(url);
    }
  });
  bindEvents();
  createTab();
}

init();
