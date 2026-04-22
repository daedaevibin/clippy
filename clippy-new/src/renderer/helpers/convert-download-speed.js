"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettyDownloadSpeed = void 0;
/**
 * Converts a download speed from bytes per second to a more readable format
 *
 * @param bytesPerSecond
 * @returns
 */
function prettyDownloadSpeed(bytesPerSecond) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let index = 0;
    let speed = bytesPerSecond;
    while (speed >= 1024 && index < units.length - 1) {
        speed /= 1024;
        index++;
    }
    return `${speed.toFixed(2)} ${units[index]}`;
}
exports.prettyDownloadSpeed = prettyDownloadSpeed;
