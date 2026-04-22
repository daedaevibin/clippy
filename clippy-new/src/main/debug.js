"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDebugManager = void 0;
const electron_store_1 = __importDefault(require("electron-store"));
const windows_1 = require("./windows");
const ipc_messages_1 = require("../ipc-messages");
class DebugManager {
    store;
    constructor() {
        this.store = new electron_store_1.default({
            name: "debug",
            defaults: {
                simulateDownload: false,
                simulateLoadModel: false,
                simulateNoModelsDownloaded: false,
                openDevToolsOnStart: false,
                enableDragDebug: false,
            },
        });
    }
    /**
     * Notifies the renderer that the state has changed.
     *
     * @param newValue
     */
    onDidAnyChange(newValue = this.store.store) {
        (0, windows_1.getMainWindow)()?.webContents.send(ipc_messages_1.IpcMessages.DEBUG_STATE_CHANGED, newValue);
    }
}
let _debugManager = null;
/**
 * Get the debug manager
 *
 * @returns The debug manager
 */
function getDebugManager() {
    if (!_debugManager) {
        _debugManager = new DebugManager();
    }
    return _debugManager;
}
exports.getDebugManager = getDebugManager;
