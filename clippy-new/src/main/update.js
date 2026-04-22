"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestVersionFromGitHub = exports.checkForUpdates = exports.setupAutoUpdater = void 0;
const electron_1 = require("electron");
const logger_1 = require("./logger");
/**
 * Setup the auto updater
 */
function setupAutoUpdater() {
    // Auto updater is disabled on Linux as it's typically handled by package managers.
    (0, logger_1.getLogger)().info("Auto-updater skipped on Linux");
}
exports.setupAutoUpdater = setupAutoUpdater;
/**
 * Check for updates
 *
 * @returns {Promise<void>}
 */
async function checkForUpdates() {
    if (!electron_1.app.isPackaged) {
        return electron_1.dialog.showMessageBox({
            type: "info",
            title: "Update Check",
            message: "You are running a development version of Clippy, so the update check is disabled.",
        });
    }
    try {
        const latestVersion = await getLatestVersionFromGitHub();
        const currentVersion = electron_1.app.getVersion();
        if (latestVersion &&
            latestVersion !== `v${currentVersion}` &&
            latestVersion !== currentVersion) {
            const result = await electron_1.dialog.showMessageBox({
                type: "info",
                title: "Update Available",
                message: `A new version (${latestVersion}) is available. You are currently running ${currentVersion}. Would you like to visit the download page?`,
                buttons: ["Open Download Page", "Close"],
            });
            if (result.response === 0) {
                electron_1.shell.openExternal("https://github.com/felixrieseberg/clippy/releases/latest");
            }
        }
        else {
            await electron_1.dialog.showMessageBox({
                type: "info",
                title: "You're Up-to-Date",
                message: `You are already using the latest version of Clippy (${currentVersion}).`,
            });
        }
    }
    catch (error) {
        const result = await electron_1.dialog.showMessageBox({
            type: "error",
            title: "Update Check Failed",
            message: `An error occurred while checking for updates: ${error}. Would you like to visit the homepage to check for updates manually?`,
            buttons: ["Open Homepage", "Cancel"],
        });
        if (result.response === 0) {
            electron_1.shell.openExternal("https://felixrieseberg.github.io/clippy/");
        }
    }
}
exports.checkForUpdates = checkForUpdates;
/**
 * Get's the latest version's tag_name from GitHub. Returns null if it fails.
 *
 * @returns {Promise<string>} The latest version from GitHub
 */
async function getLatestVersionFromGitHub() {
    try {
        const response = await fetch("https://api.github.com/repos/felixrieseberg/clippy/releases/latest");
        const data = await response.json();
        return data.tag_name;
    }
    catch (error) {
        (0, logger_1.getLogger)().warn("Failed to fetch latest version from GitHub", error);
        return null;
    }
}
exports.getLatestVersionFromGitHub = getLatestVersionFromGitHub;
