"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModelFileName = exports.getModelPath = exports.isModelOnDisk = exports.getModelManager = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("./logger");
const models_1 = require("../models");
const state_1 = require("./state");
const MockDownloadItem_1 = require("./MockDownloadItem");
const debug_1 = require("./debug");
class ModelManager {
    downloadItems = {};
    constructor() {
        electron_1.session.defaultSession.on("will-download", (event, downloadItem) => this.onSessionWillDownload(event, downloadItem));
    }
    get models() {
        return (0, state_1.getStateManager)().store.get("models");
    }
    set models(models) {
        (0, state_1.getStateManager)().store.set("models", models);
    }
    /**
     * Returns a managed model from a model
     *
     * @param model
     * @returns
     */
    getManagedModelFromModel(model) {
        return {
            ...model,
            downloaded: this.getIsModelDownloaded(model),
            path: getModelPath(model),
        };
    }
    /**
     * Downloads a model by name
     *
     * @param name
     */
    async downloadModelByName(name) {
        (0, logger_1.getLogger)().info("Downloading model by name", name);
        const model = this.models[name];
        if (!model) {
            throw new Error(`Model not found: ${name}`);
        }
        // Cancel existing download if any
        if (this.downloadItems[name]) {
            try {
                this.downloadItems[name].cancel();
            }
            catch (error) {
                (0, logger_1.getLogger)().error(`ModelManager: Error canceling download: ${name}`, error);
            }
            delete this.downloadItems[name];
        }
        // Set model state
        model.downloaded = false;
        model.path = getModelPath(model);
        if ((0, debug_1.getDebugManager)().store.get("simulateDownload")) {
            this.downloadItems[name] = new MockDownloadItem_1.MockDownloadItem(model, () => {
                model.downloaded = true;
                this.pollRendererModelState();
            });
        }
        else {
            if (model.url) {
                electron_1.session.defaultSession.downloadURL(model.url);
            }
        }
        setTimeout(() => {
            this.pollRendererModelState();
        }, 500);
    }
    /**
     * Removes models from state without deleting them from disk
     *
     * @param name {string}
     * @returns {Promise<void>}
     */
    async removeModelByName(name) {
        (0, logger_1.getLogger)().info("Removing model by name", name);
        const models = { ...this.models };
        if (models[name]) {
            this.cancelDownload(this.models[name]);
            delete models[name];
            this.models = models;
        }
        this.pollRendererModelState();
    }
    /**
     * Deletes a model by name
     *
     * @param name
     * @returns
     */
    async deleteModelByName(name) {
        (0, logger_1.getLogger)().info("Deleting model by name", name);
        const model = this.models[name];
        if (!model || !model.path) {
            (0, logger_1.getLogger)().warn(`ModelManager deleteModelByName: Model not found: ${name}`);
            throw new Error(`Model not found: ${name}`);
        }
        if (model.imported) {
            (0, logger_1.getLogger)().warn(`ModelManager deleteModelByName: Tried to delete imported model: ${name}`);
            throw new Error(`Refusing to delete imported model: ${name}`);
        }
        this.cancelDownload(model);
        if (fs_1.default.existsSync(model.path)) {
            try {
                await fs_1.default.promises.unlink(model.path);
                model.downloaded = false;
                model.path = undefined;
            }
            catch (error) {
                (0, logger_1.getLogger)().error(`ModelManager: Error deleting model: ${name}`, error);
                return false;
            }
        }
        this.pollRendererModelState();
        return true;
    }
    /**
     * Returns a model by name
     *
     * @param name
     * @returns
     */
    getModelByName(name) {
        return this.models[name];
    }
    /**
     * Deletes all models
     */
    async deleteAllModels() {
        this.cancelAllDownloads();
        try {
            await fs_1.default.promises.rm(path_1.default.join(electron_1.app.getPath("userData"), "models"), {
                recursive: true,
            });
        }
        catch (error) {
            (0, logger_1.getLogger)().error(`ModelManager: Error deleting all models`, error);
        }
        this.pollRendererModelState();
    }
    /**
     * Polls the renderer model state
     */
    pollRendererModelState() {
        process.nextTick(() => {
            (0, state_1.getStateManager)().store.set("models", this.getRendererModelState());
            (0, state_1.getStateManager)().onDidAnyChange();
        });
    }
    /**
     * Returns the initial renderer model state
     *
     * @returns
     */
    getInitialRendererModelState() {
        const result = {};
        for (const model of models_1.BUILT_IN_MODELS) {
            result[model.name] = this.getManagedModelFromModel(model);
        }
        return result;
    }
    /**
     * Returns the state of the models for the renderer
     *
     * @returns
     */
    getRendererModelState() {
        const result = {};
        for (const model of Object.values(this.models)) {
            const downloadItem = this.downloadItems[model.name];
            const downloadState = downloadItem
                ? {
                    totalBytes: downloadItem.getTotalBytes(),
                    receivedBytes: downloadItem.getReceivedBytes(),
                    percentComplete: "getPercentComplete" in downloadItem
                        ? downloadItem.getPercentComplete()
                        : (downloadItem.getReceivedBytes() /
                            downloadItem.getTotalBytes()) *
                            100,
                    startTime: downloadItem.getStartTime(),
                    savePath: downloadItem.getSavePath(),
                    currentBytesPerSecond: "getCurrentBytesPerSecond" in downloadItem
                        ? downloadItem.getCurrentBytesPerSecond()
                        : 0,
                    state: downloadItem.getState(),
                }
                : undefined;
            result[model.name] = {
                name: model.name,
                company: model.company,
                size: model.size,
                url: model.url,
                path: model.path,
                description: model.description,
                homepage: model.homepage,
                imported: model.imported,
                downloaded: this.getIsModelDownloaded(model),
                downloadState,
            };
        }
        return result;
    }
    /**
     * Returns true if the model exists on disk and is not downloading
     *
     * @param model
     * @returns
     */
    getIsModelDownloaded(model) {
        if (model.name.startsWith("Gemini")) {
            return true;
        }
        if ((0, debug_1.getDebugManager)().store.get("simulateNoModelsDownloaded")) {
            return false;
        }
        const existsOnDisk = isModelOnDisk(model);
        const hasDownloadItem = this.downloadItems[model.name];
        const isDownloading = hasDownloadItem &&
            this.downloadItems[model.name].getState() !== "completed";
        return existsOnDisk && !isDownloading;
    }
    /**
     * Opens a file dialog to select a GGUF file and adds it as a model
     */
    async addModelFromFile() {
        try {
            const result = await electron_1.dialog.showOpenDialog({
                title: "Select a GGUF Model File",
                defaultPath: electron_1.app.getPath("downloads"),
                filters: [{ name: "GGUF Model Files", extensions: ["gguf"] }],
                properties: ["openFile"],
            });
            if (result.canceled || result.filePaths.length === 0) {
                (0, logger_1.getLogger)().info("No file selected for adding model.");
                return;
            }
            const filePath = result.filePaths[0];
            const fileName = path_1.default.basename(filePath);
            if (this.models[fileName]) {
                const overwrite = await electron_1.dialog.showMessageBox({
                    type: "warning",
                    buttons: ["Overwrite", "Cancel"],
                    defaultId: 1,
                    title: "Model Already Exists",
                    message: `A model with the name "${fileName}" already exists. Do you want to overwrite the entry in Clippy? This will not delete the file on disk.`,
                });
                if (overwrite.response !== 0) {
                    (0, logger_1.getLogger)().info("User canceled overwriting the existing model.");
                    return;
                }
            }
            const model = {
                name: fileName,
                size: Math.round(fs_1.default.statSync(filePath).size / (1024 * 1024)),
                path: filePath,
                description: `Imported GGUF model from ${filePath}.`,
                imported: true,
            };
            const models = { ...this.models, [fileName]: model };
            (0, state_1.getStateManager)().store.set("models", models);
            this.pollRendererModelState();
            (0, logger_1.getLogger)().info(`Model added from file: ${filePath}`);
        }
        catch (error) {
            (0, logger_1.getLogger)().error("Error adding model from file", error);
        }
    }
    /**
     * Handles the will-download event
     *
     * @param downloadItem
     */
    onSessionWillDownload(event, downloadItem) {
        const urlChain = downloadItem.getURLChain();
        const urlStr = urlChain[0];
        const modelKey = Object.keys(this.models).find((k) => this.models[k].url === urlStr);
        const model = modelKey ? this.models[modelKey] : undefined;
        if (!model) {
            (0, logger_1.getLogger)().info(`ModelManager: Handling will-download event for ${urlStr}, but did not find matching model. Disallowing download.`);
            event.preventDefault();
            return false;
        }
        // Check if there's already a download in progress for this model
        const existingDownload = this.downloadItems[model.name];
        if (existingDownload && existingDownload.getState() === "progressing") {
            (0, logger_1.getLogger)().info(`ModelManager: Download already in progress for model ${model.name}. Disallowing duplicate download.`);
            event.preventDefault();
            return false;
        }
        (0, logger_1.getLogger)().info(`ModelManager: Handling will-download event for model ${model.name}. Allowing download.`);
        model.path = getModelPath(model);
        model.downloaded = false;
        this.downloadItems[model.name] = downloadItem;
        downloadItem.setSavePath(model.path);
        return true;
    }
    /**
     * Cancels a download by name
     *
     * @param name
     */
    cancelDownload(model) {
        if (this.isModelDownloading(model)) {
            try {
                this.downloadItems[model.name].cancel();
            }
            catch (error) {
                (0, logger_1.getLogger)().error(`ModelManager: Error canceling download: ${model.name}`, error);
            }
            delete this.downloadItems[model.name];
        }
    }
    /**
     * Cancels all downloads
     */
    cancelAllDownloads() {
        for (const name in this.downloadItems) {
            this.cancelDownload(this.models[name]);
        }
    }
    /**
     * Returns true if the model is downloading
     *
     * @param model
     * @returns
     */
    isModelDownloading(model) {
        return (this.downloadItems[model.name] &&
            this.downloadItems[model.name].getState() !== "completed");
    }
}
let _modelManager;
function getModelManager() {
    if (!_modelManager) {
        _modelManager = new ModelManager();
    }
    return _modelManager;
}
exports.getModelManager = getModelManager;
/**
 * Returns true if the model is on disk
 *
 * @param model
 * @returns {boolean}
 */
function isModelOnDisk(model) {
    const filePath = "path" in model ? model.path : getModelPath(model);
    if (!filePath) {
        return false;
    }
    const existsOnDisk = fs_1.default.existsSync(filePath);
    return existsOnDisk;
}
exports.isModelOnDisk = isModelOnDisk;
/**
 * Returns the path to the model on disk
 *
 * @param model
 * @returns {string}
 */
function getModelPath(model) {
    if (!model.url) {
        return "";
    }
    return path_1.default.join(electron_1.app.getPath("userData"), "models", getModelFileName(model));
}
exports.getModelPath = getModelPath;
/**
 * Returns the file name of the model
 *
 * @param model
 * @returns {string}
 */
function getModelFileName(model) {
    if (!model.url) {
        return "";
    }
    return path_1.default.basename(new URL(model.url).pathname);
}
exports.getModelFileName = getModelFileName;
