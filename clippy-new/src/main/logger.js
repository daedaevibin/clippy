"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = void 0;
let _log = undefined;
function getElectronLog() {
    if (_log) {
        return _log;
    }
    return (_log = require("electron-log"));
}
function getLogger() {
    return getElectronLog();
}
exports.getLogger = getLogger;
