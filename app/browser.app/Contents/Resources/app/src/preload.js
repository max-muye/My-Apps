const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("browserApi", {
  loadStore: () => ipcRenderer.invoke("store:load"),
  setBookmarks: (bookmarks) => ipcRenderer.invoke("bookmarks:set", bookmarks),
  setSettings: (settings) => ipcRenderer.invoke("settings:set", settings),
  openExternal: (url) => ipcRenderer.invoke("link:openExternal", url),
  onOpenRequest: (callback) => {
    ipcRenderer.on("tab:open-request", (_event, url) => callback(url));
  }
});
