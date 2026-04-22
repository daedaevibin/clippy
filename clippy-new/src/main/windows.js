"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setFont = exports.setFontSize = exports.maximizeChatWindow = exports.minimizeChatWindow = exports.toggleChatWindow = exports.getChatWindow = exports.getPopoverWindowPosition = exports.setupWindowOpenHandler = exports.setupWindowListener = exports.createMainWindow = exports.getMainWindow = void 0;
const electron_1 = require("electron");
const electron_context_menu_1 = __importDefault(require("electron-context-menu"));
const logger_1 = require("./logger");
const path_1 = __importDefault(require("path"));
const state_1 = require("./state");
let mainWindow;
/**
 * Get the main window
 *
 * @returns The main window
 */
function getMainWindow() {
    return mainWindow;
}
exports.getMainWindow = getMainWindow;
/**
 * Create the main window
 *
 * @returns The main window
 */
async function createMainWindow() {
    (0, logger_1.getLogger)().info("Creating main window");
    if (mainWindow && !mainWindow.isDestroyed()) {
        (0, logger_1.getLogger)().info("Main window already exists, skipping creation");
        return;
    }
    const settings = (0, state_1.getStateManager)().store.get("settings");
    mainWindow = new electron_1.BrowserWindow({
        width: 125,
        height: 100,
        transparent: true,
        frame: false,
        acceptFirstMouse: true,
        backgroundMaterial: "none",
        resizable: false,
        maximizable: false,
        title: "Clippy",
        alwaysOnTop: settings.clippyAlwaysOnTop,
        webPreferences: {
            preload: path_1.default.join(__dirname, "preload.js"),
        },
    });
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }
    mainWindow.on("system-context-menu", (event) => {
        event.preventDefault();
        // popupAppMenu();
    });
    mainWindow.webContents.on("context-menu", (event) => {
        event.preventDefault();
        // popupAppMenu();
    });
}
exports.createMainWindow = createMainWindow;
function setupWindowListener() {
    electron_1.app.on("browser-window-created", (_event, browserWindow) => {
        const isMainWindow = !browserWindow.getParentWindow();
        (0, logger_1.getLogger)().info(`Creating window (${isMainWindow ? "main" : "child"})`);
        setupWindowOpenHandler(browserWindow);
        setupNavigationHandler(browserWindow);
        if (!isMainWindow) {
            (0, electron_context_menu_1.default)({
                window: browserWindow,
            });
        }
        /*
        if (getDebugManager().store.get("openDevToolsOnStart")) {
          browserWindow.webContents.openDevTools({ mode: "detach" });
        }
        */
        browserWindow.webContents.on("did-finish-load", () => {
            setFontSize((0, state_1.getStateManager)().store.get("settings").defaultFontSize, [browserWindow]);
            setFont((0, state_1.getStateManager)().store.get("settings").defaultFont, [
                browserWindow,
            ]);
        });
    });
}
exports.setupWindowListener = setupWindowListener;
/**
 * Setup the window open handler
 *
 * @param browserWindow The browser window
 */
function setupWindowOpenHandler(browserWindow) {
    browserWindow.webContents.setWindowOpenHandler(({ url, features }) => {
        if (url.startsWith("http")) {
            electron_1.shell.openExternal(url);
            return { action: "deny" };
        }
        (0, logger_1.getLogger)().info(`window.open() called with features: ${features}`);
        const width = parseInt(features.match(/width=(\d+)/)?.[1] || "400", 10);
        const height = parseInt(features.match(/height=(\d+)/)?.[1] || "600", 10);
        const shouldPositionNextToParent = features.includes("positionNextToParent");
        const newWindowPosition = shouldPositionNextToParent
            ? getPopoverWindowPosition(browserWindow, { width, height })
            : undefined;
        return {
            action: "allow",
            overrideBrowserWindowOptions: {
                frame: false,
                x: newWindowPosition?.x,
                y: newWindowPosition?.y,
                minHeight: 400,
                minWidth: 400,
                alwaysOnTop: (0, state_1.getStateManager)().store.get("settings")
                    .chatAlwaysOnTop,
                parent: browserWindow,
            },
        };
    });
}
exports.setupWindowOpenHandler = setupWindowOpenHandler;
function setupNavigationHandler(browserWindow) {
    browserWindow.webContents.on("will-navigate", (event, url) => {
        event.preventDefault();
        if (url.startsWith("http")) {
            electron_1.shell.openExternal(url);
        }
    });
}
/**
 * Get the new window position for a popover-like window
 *
 * @param browserWindow The browser window
 * @param size The size of the new window
 * @returns The new window position
 */
function getPopoverWindowPosition(browserWindow, size) {
    const parentBounds = browserWindow.getBounds();
    const { width, height } = size;
    const SPACING = 50; // Distance between windows
    // Get the current display
    const displays = electron_1.screen.getAllDisplays();
    const display = displays.find((display) => parentBounds.x >= display.bounds.x &&
        parentBounds.x <= display.bounds.x + display.bounds.width) || displays[0];
    // Calculate horizontal position (left or right of parent)
    let x;
    const leftPosition = parentBounds.x - width - SPACING;
    // If left position would be off-screen, position to the right
    if (leftPosition < display.bounds.x) {
        x = parentBounds.x + parentBounds.width + SPACING;
    }
    else {
        x = leftPosition;
    }
    // Try to align the bottom of the new window with the parent window
    let y = parentBounds.y + parentBounds.height - height;
    // Check if the window would be too high (off-screen at the top)
    if (y < display.bounds.y) {
        // Move the window down as much as necessary
        y = display.bounds.y;
    }
    return { x, y };
}
exports.getPopoverWindowPosition = getPopoverWindowPosition;
/**
 * Get the chat window
 *
 * @returns The chat window
 */
function getChatWindow() {
    return electron_1.BrowserWindow.getAllWindows().find(isChatWindow);
}
exports.getChatWindow = getChatWindow;
/**
 * Check if a window is a chat window
 *
 * @param window The window to check
 * @returns True if the window is a chat window
 */
function isChatWindow(window) {
    return window.webContents.getTitle() === "Clippy Chat";
}
/**
 * Toggle the chat window
 */
function toggleChatWindow() {
    const chatWindow = getChatWindow();
    if (!chatWindow) {
        return;
    }
    if (chatWindow.isVisible()) {
        chatWindow.hide();
    }
    else {
        const mainWindow = getMainWindow();
        if (!mainWindow)
            return;
        const [width, height] = chatWindow.getSize();
        const position = getPopoverWindowPosition(mainWindow, { width, height });
        chatWindow.setPosition(position.x, position.y);
        chatWindow.show();
        chatWindow.focus();
    }
}
exports.toggleChatWindow = toggleChatWindow;
/**
 * Minimize the chat window
 */
function minimizeChatWindow() {
    return getChatWindow()?.minimize();
}
exports.minimizeChatWindow = minimizeChatWindow;
/**
 * Maximize the chat window
 */
function maximizeChatWindow() {
    if (getChatWindow()?.isMaximized()) {
        return getChatWindow()?.unmaximize();
    }
    return getChatWindow()?.maximize();
}
exports.maximizeChatWindow = maximizeChatWindow;
/**
 * Set the font size for all windows
 *
 * @param fontSize The font size to set
 */
function setFontSize(fontSize, windows = electron_1.BrowserWindow.getAllWindows()) {
    windows.forEach((window) => {
        window.webContents.executeJavaScript(`document.documentElement.style.setProperty('--font-size', '${fontSize}px');`);
    });
}
exports.setFontSize = setFontSize;
/**
 * Set the font for all windows
 *
 * @param font The font to set
 */
function setFont(font, windows = electron_1.BrowserWindow.getAllWindows()) {
    windows.forEach((window) => {
        window.webContents.executeJavaScript(`document.querySelector('.clippy').setAttribute('data-font', '${font}');`);
    });
}
exports.setFont = setFont;
