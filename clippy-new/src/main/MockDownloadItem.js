"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockDownloadItem = void 0;
const logger_1 = require("./logger");
/**
 * Mock implementation of Electron's DownloadItem for download simulation
 */
class MockDownloadItem {
    _receivedBytes = 0;
    _totalBytes;
    _startTime;
    _savePath;
    _state = "progressing";
    _intervalId;
    _name;
    constructor(model, onComplete) {
        this._name = model.name;
        this._totalBytes = model.size * 1024 * 1024; // Convert MB to bytes
        this._startTime = Date.now();
        this._savePath = model.path;
        // Simulation parameters
        const downloadDuration = 10 * 1000; // 10 seconds
        const updateInterval = 100; // Update every 100ms
        (0, logger_1.getLogger)().info(`MockDownloadItem: Simulating download for model: ${model.name} (will take 10 seconds)`);
        // Simulate download progress
        this._intervalId = setInterval(() => {
            const elapsedTime = Date.now() - this._startTime;
            const progress = Math.min(elapsedTime / downloadDuration, 1);
            this._receivedBytes = Math.floor(this._totalBytes * progress);
            // Complete download after 10 seconds
            if (progress >= 1) {
                clearInterval(this._intervalId);
                this._state = "completed";
                (0, logger_1.getLogger)().info(`MockDownloadItem: Simulated download completed for model: ${model.name}`);
                onComplete();
            }
        }, updateInterval);
    }
    getTotalBytes() {
        return this._totalBytes;
    }
    getReceivedBytes() {
        return this._receivedBytes;
    }
    getPercentComplete() {
        return (this._receivedBytes / this._totalBytes) * 100;
    }
    getStartTime() {
        return this._startTime;
    }
    getSavePath() {
        return this._savePath;
    }
    getCurrentBytesPerSecond() {
        return this._totalBytes / 10; // Constant rate over 10 seconds
    }
    getState() {
        return this._state;
    }
    cancel() {
        clearInterval(this._intervalId);
        this._state = "cancelled";
        (0, logger_1.getLogger)().info(`MockDownloadItem: Cancelled download for model: ${this._name}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setSavePath(_path) {
        // No-op for mock
    }
}
exports.MockDownloadItem = MockDownloadItem;
