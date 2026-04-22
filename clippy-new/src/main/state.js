"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStateManager = exports.StateManager = void 0;
const electron_store_1 = __importDefault(require("electron-store"));
const windows_1 = require("./windows");
const ipc_messages_1 = require("../ipc-messages");
const models_1 = require("./models");
const sharedState_1 = require("../sharedState");
const models_2 = require("../models");
const logger_1 = require("./logger");
const menu_1 = require("./menu");
class StateManager {
    store = new electron_store_1.default({
        defaults: {
            ...sharedState_1.EMPTY_SHARED_STATE,
            models: (0, models_1.getModelManager)().getInitialRendererModelState(),
        },
    });
    constructor() {
        this.ensureCorrectModelState();
        this.ensureCorrectSettingsState();
        this.store.onDidAnyChange(this.onDidAnyChange);
        // Handle settings changes
        this.store.onDidChange("settings", (newValue, oldValue) => {
            this.onSettingsChange(newValue, oldValue);
        });
    }
    updateModelState() {
        this.store.set("models", (0, models_1.getModelManager)().getRendererModelState());
    }
    ensureCorrectSettingsState() {
        const settings = this.store.get("settings");
        // Default model exists?
        if (settings.selectedModel) {
            const model = this.store.get("models")[settings.selectedModel];
            if (!model) {
                settings.selectedModel = undefined;
            }
        }
        if (settings.topK === undefined) {
            settings.topK = 10;
        }
        if (settings.temperature === undefined) {
            settings.temperature = 0.7;
        }
        this.store.set("settings", settings);
    }
    ensureCorrectModelState() {
        const models = this.store.get("models");
        if (models === undefined || Object.keys(models).length === 0) {
            this.store.set("models", (0, models_1.getModelManager)().getInitialRendererModelState());
            return;
        }
        // Make sure we update the fs state for all models
        for (const modelName of Object.keys(models)) {
            const model = models[modelName];
            if (model.imported) {
                if (!(0, models_1.isModelOnDisk)(model)) {
                    delete models[modelName];
                }
            }
            else {
                model.downloaded = (0, models_1.isModelOnDisk)(model);
                model.path = (0, models_1.getModelPath)(model);
            }
        }
        // Make sure all models from the constant are in state
        for (const model of models_2.BUILT_IN_MODELS) {
            if (!(model.name in models)) {
                models[model.name] = (0, models_1.getModelManager)().getManagedModelFromModel(model);
            }
            else {
                // Only update built-in models, do not overwrite imported models
                if (!models[model.name].imported) {
                    models[model.name].description = model.description;
                    models[model.name].homepage = model.homepage;
                    models[model.name].size = model.size;
                    models[model.name].url = model.url;
                }
            }
        }
        this.store.set("models", models);
    }
    onSettingsChange(newValue, oldValue) {
        if (!oldValue) {
            return;
        }
        if (oldValue.clippyAlwaysOnTop !== newValue.clippyAlwaysOnTop) {
            (0, logger_1.getLogger)().info(`Setting clippyAlwaysOnTop to ${newValue.clippyAlwaysOnTop}`);
            (0, windows_1.getMainWindow)()?.setAlwaysOnTop(!!newValue.clippyAlwaysOnTop, "floating");
        }
        if (oldValue.chatAlwaysOnTop !== newValue.chatAlwaysOnTop) {
            (0, logger_1.getLogger)().info(`Setting chatAlwaysOnTop to ${newValue.chatAlwaysOnTop}`);
            (0, windows_1.getChatWindow)()?.setAlwaysOnTop(!!newValue.chatAlwaysOnTop, "floating");
        }
        if (oldValue.defaultFontSize !== newValue.defaultFontSize) {
            (0, windows_1.setFontSize)(newValue.defaultFontSize);
        }
        if (oldValue.defaultFont !== newValue.defaultFont) {
            (0, windows_1.setFont)(newValue.defaultFont);
        }
        // Update the menu, which contains state
        (0, menu_1.setupAppMenu)();
        // Log the settings change by getting a deep diff
        const diff = Object.keys(newValue).reduce((acc, key) => {
            const typedKey = key;
            if (newValue[typedKey] !== oldValue[typedKey]) {
                acc[typedKey] = newValue[typedKey];
            }
            return acc;
        }, {});
        (0, logger_1.getLogger)().info("Settings changed", diff);
    }
    onDidAnyChange(newValue = this.store.store) {
        (0, windows_1.getMainWindow)()?.webContents.send(ipc_messages_1.IpcMessages.STATE_CHANGED, newValue);
    }
}
exports.StateManager = StateManager;
let _stateManager = null;
function getStateManager() {
    if (!_stateManager) {
        _stateManager = new StateManager();
    }
    return _stateManager;
}
exports.getStateManager = getStateManager;
