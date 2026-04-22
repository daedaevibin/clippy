"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeInspector = exports.openInspector = exports.getIsInspectorEnabled = void 0;
const inspector = __importStar(require("node:inspector"));
const electron_1 = require("electron");
const execPromise_1 = require("./helpers/execPromise");
const logger_1 = require("./logger");
/**
 * Is the inspector enabled?
 *
 * @returns {boolean} True if the inspector is enabled, false otherwise.
 */
function getIsInspectorEnabled() {
    return inspector.url() !== undefined;
}
exports.getIsInspectorEnabled = getIsInspectorEnabled;
async function openInspector() {
    try {
        if (getIsInspectorEnabled()) {
            closeInspector();
        }
        inspector.open();
        await openChromeInspect();
    }
    catch (error) {
        (0, logger_1.getLogger)().warn("Debugger: Failed to enable main process debugger (node inspector)", error);
    }
}
exports.openInspector = openInspector;
function closeInspector() {
    try {
        inspector.close();
    }
    catch (error) {
        (0, logger_1.getLogger)().warn("Debugger: Failed to close main process debugger (node inspector)", error);
    }
}
exports.closeInspector = closeInspector;
/**
 * Opens the Chrome DevTools inspector.
 *
 * @returns {Promise<void>} A promise that resolves when the inspector is opened.
 */
async function openChromeInspect() {
    try {
        if (process.platform === "darwin") {
            await (0, execPromise_1.execPromise)("open -a 'Google Chrome' chrome://inspect");
        }
        else if (process.platform === "win32") {
            await (0, execPromise_1.execPromise)("start chrome chrome://inspect");
        }
        else if (process.platform === "linux") {
            await (0, execPromise_1.execPromise)("xdg-open chrome://inspect");
        }
    }
    catch (error) {
        (0, logger_1.getLogger)().warn("Debugger: Failed to open Chrome DevTools", error);
        await electron_1.dialog.showMessageBox({
            title: "Inspector",
            message: "Inspector session is active. Please open Chrome DevTools (chrome://inspect) in a browser of your choice.",
        });
    }
}
