const { app, BrowserWindow, ipcMain, session, shell } = require("electron");
const fs = require("fs/promises");
const path = require("path");

const DEFAULT_STORE = {
  bookmarks: [],
  settings: {
    homeUrl: "https://www.google.com",
    searchEngine: "https://www.google.com/search?q=%s",
    openExternalLinks: false
  }
};

let mainWindow;

function storePath() {
  return path.join(app.getPath("userData"), "browser-store.json");
}

async function readStore() {
  try {
    const raw = await fs.readFile(storePath(), "utf8");
    return {
      ...DEFAULT_STORE,
      ...JSON.parse(raw)
    };
  } catch {
    return DEFAULT_STORE;
  }
}

async function writeStore(nextStore) {
  await fs.mkdir(path.dirname(storePath()), { recursive: true });
  await fs.writeFile(storePath(), JSON.stringify(nextStore, null, 2));
  return nextStore;
}

async function updateStore(updater) {
  const current = await readStore();
  return writeStore(updater(current));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 920,
    minHeight: 620,
    title: "Desktop Browser",
    backgroundColor: "#f6f7f9",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true
    }
  });

  mainWindow.webContents.on("will-attach-webview", (_event, webPreferences) => {
    delete webPreferences.preload;
    webPreferences.nodeIntegration = false;
    webPreferences.contextIsolation = true;
  });

  mainWindow.webContents.on("did-attach-webview", (_event, guestContents) => {
    guestContents.setWindowOpenHandler(({ url }) => {
      mainWindow?.webContents.send("tab:open-request", url);
      return { action: "deny" };
    });
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionCheckHandler((_webContents, permission) => {
    return ["fullscreen", "pointerLock"].includes(permission);
  });

  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(["fullscreen", "pointerLock"].includes(permission));
  });

  ipcMain.handle("store:load", readStore);

  ipcMain.handle("bookmarks:set", async (_event, bookmarks) => {
    return updateStore((store) => ({ ...store, bookmarks }));
  });

  ipcMain.handle("settings:set", async (_event, settings) => {
    return updateStore((store) => ({
      ...store,
      settings: { ...store.settings, ...settings }
    }));
  });

  ipcMain.handle("link:openExternal", async (_event, url) => {
    const target = new URL(url);
    if (!["http:", "https:"].includes(target.protocol)) {
      throw new Error("Only HTTP and HTTPS links can be opened externally.");
    }
    await shell.openExternal(target.toString());
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
