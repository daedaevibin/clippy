"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainAppMenu = exports.popupAppMenu = exports.setupAppMenu = void 0;
const electron_1 = require("electron");
const logger_1 = require("./logger");
const state_1 = require("./state");
const windows_1 = require("./windows");
const ipc_messages_1 = require("../ipc-messages");
const update_1 = require("./update");
/*
import {
  closeInspector,
  getIsInspectorEnabled,
  openInspector,
} from "./debugger";
*/
/**
 * Setup the application menu
 */
function setupAppMenu() {
    electron_1.Menu.setApplicationMenu(getMainAppMenu());
}
exports.setupAppMenu = setupAppMenu;
/**
 * Popup the application menu
 *
 * @param options {Electron.PopupOptions} Options for the popup
 */
function popupAppMenu(options = {}) {
    getMainAppMenu().popup(options);
}
exports.popupAppMenu = popupAppMenu;
/**
 * Setup the application menu
 */
function getMainAppMenu() {
    const template = [
        {
            label: "File",
            submenu: getFileMenu(),
        },
        { role: "editMenu" },
        { label: "View", submenu: getViewMenu() },
        {
            role: "windowMenu",
            id: "windowMenu",
        },
        { role: "help", submenu: getHelpMenu() },
    ];
    const menu = electron_1.Menu.buildFromTemplate(template);
    // Insert window options
    const windowMenu = menu.getMenuItemById("windowMenu");
    windowMenu?.submenu?.append(new electron_1.MenuItem({ type: "separator" }));
    windowMenu?.submenu?.append(new electron_1.MenuItem({
        label: "Always Show Clippy on Top",
        type: "checkbox",
        checked: (0, state_1.getStateManager)().store.get("settings")
            .clippyAlwaysOnTop,
        click: (menuItem) => {
            (0, state_1.getStateManager)().store.set("settings.clippyAlwaysOnTop", menuItem.checked);
        },
    }));
    windowMenu?.submenu?.append(new electron_1.MenuItem({
        label: "Always Show Chat Window on Top",
        type: "checkbox",
        checked: (0, state_1.getStateManager)().store.get("settings").chatAlwaysOnTop,
        click: (menuItem) => {
            (0, state_1.getStateManager)().store.set("settings.chatAlwaysOnTop", menuItem.checked);
        },
    }));
    windowMenu?.submenu?.append(new electron_1.MenuItem({
        type: "separator",
    }));
    windowMenu?.submenu?.append(new electron_1.MenuItem({
        label: "Toggle Chat Window",
        click: () => (0, windows_1.toggleChatWindow)(),
        accelerator: "Cmd+`",
    }));
    return menu;
}
exports.getMainAppMenu = getMainAppMenu;
function getFileMenu() {
    const template = [
        {
            label: "New Chat",
            accelerator: "CmdOrCtrl+N",
            click: () => {
                (0, windows_1.getMainWindow)()?.webContents.send(ipc_messages_1.IpcMessages.CHAT_NEW_CHAT);
            },
        },
        { role: "close" },
        { type: "separator" },
        {
            label: "Settings",
            click: () => openView("settings-general"),
            accelerator: "CmdOrCtrl+,",
        },
        { type: "separator" },
        {
            label: "Check for Updates…",
            click: () => (0, update_1.checkForUpdates)(),
        },
        { role: "quit" },
    ];
    return template;
}
function getViewMenu() {
    return [
        {
            label: "Chat",
            click: () => openView("chat"),
        },
        {
            label: "Chat History",
            click: () => openView("chats"),
        },
        { type: "separator" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
    ];
}
function getSettingsMenuItem() {
    return new electron_1.MenuItem({
        label: "Settings",
        submenu: electron_1.Menu.buildFromTemplate([
            {
                label: "General",
                click: () => openView("settings-general"),
                accelerator: "CmdOrCtrl+,",
            },
            {
                label: "Model",
                click: () => openView("settings-model"),
            },
            {
                label: "Parameters",
                click: () => openView("settings-parameters"),
            },
            {
                label: "Advanced",
                click: () => openView("settings-advanced"),
            },
            {
                label: "About",
                click: () => openView("settings-about"),
            },
        ]),
    });
}
function getHelpMenu() {
    return [
        {
            label: "Open Clippy Website",
            click: () => {
                electron_1.shell.openExternal("https://felixrieseberg.github.io/clippy/");
            },
        },
        {
            label: "Report an Issue",
            click: () => {
                electron_1.shell.openExternal("https://github.com/felixrieseberg/clippy/issues");
            },
        },
        {
            type: "separator",
        },
        {
            label: "Open All Developer Tools",
            click: () => {
                const windows = electron_1.BrowserWindow.getAllWindows();
                for (const window of windows) {
                    window.webContents.openDevTools({ mode: "detach" });
                }
            },
        },
        /*
        {
          label: "Enable Main Process Debugger",
          type: "checkbox",
          checked: getIsInspectorEnabled(),
          click: () => {
            getIsInspectorEnabled() ? closeInspector() : openInspector();
          },
        },
        */
        {
            type: "separator",
        },
        {
            label: "Open Logs",
            click: () => {
                try {
                    const fileTransport = (0, logger_1.getLogger)().transports
                        .file;
                    const logPath = fileTransport.getFile();
                    if (logPath?.path) {
                        (0, logger_1.getLogger)().info("Opening logs at", logPath.path);
                        electron_1.shell.showItemInFolder(logPath.path);
                    }
                }
                catch (error) {
                    (0, logger_1.getLogger)().error("Failed to open logs", error);
                    electron_1.dialog.showMessageBox({
                        type: "error",
                        title: "Error",
                        message: `Failed to open logs. The error was: ${error}. I'd normally tell you to check the logs for more details, but... well, you can't.`,
                    });
                }
            },
        },
    ];
}
function openView(view) {
    (0, windows_1.getMainWindow)()?.webContents.send(ipc_messages_1.IpcMessages.SET_BUBBLE_VIEW, view);
}
