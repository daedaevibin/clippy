"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const windows_1 = require("./windows");
electron_1.app.whenReady().then(() => {
    // IPC Handler
    electron_1.ipcMain.handle("ping", () => "pong");
    // Menu
    const menu = electron_1.Menu.buildFromTemplate([
        {
            label: "File",
            submenu: [{ role: "quit" }],
        },
    ]);
    electron_1.Menu.setApplicationMenu(menu);
    (0, windows_1.setupWindowListener)();
    (0, windows_1.createMainWindow)();
});
electron_1.app.on("window-all-closed", () => {
    electron_1.app.quit();
});
