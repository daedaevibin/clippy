import { app, BrowserWindow, ipcMain, Menu } from "electron";
import path from "path";
import { getLogger } from "./logger";
import { createMainWindow, setupWindowListener } from "./windows";

app.whenReady().then(() => {
  // IPC Handler
  ipcMain.handle("ping", () => "pong");

  // Menu
  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [{ role: "quit" }],
    },
  ]);
  Menu.setApplicationMenu(menu);

  setupWindowListener();
  createMainWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});
