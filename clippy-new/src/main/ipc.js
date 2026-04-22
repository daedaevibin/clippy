"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIpcListeners = void 0;
const electron_1 = require("electron");
const ipc_messages_1 = require("../ipc-messages");
const state_1 = require("./state");
// Mock imports for now until these are implemented
const toggleChatWindow = () => { };
const maximizeChatWindow = () => { };
const minimizeChatWindow = () => { };
const getModelManager = () => ({
    downloadModelByName: (name) => { },
    removeModelByName: (name) => { },
    deleteModelByName: (name) => { },
    deleteAllModels: () => { },
    addModelFromFile: () => { },
});
const getChatManager = () => ({
    getChats: () => { },
    getChatWithMessages: (chatId) => { },
    writeChatWithMessages: (chat) => { },
    deleteChat: (chatId) => { },
    deleteAllChats: () => { },
});
const getMainAppMenu = () => ({ popup: () => { } });
const checkForUpdates = () => { };
const getVersions = () => ({});
const getClippyDebugInfo = () => ({});
const getDebugManager = () => ({
    store: {
        store: {},
        set: (key, value) => { },
        get: (key) => { },
        openInEditor: () => { },
    },
});
function setupIpcListeners() {
    // Window
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.TOGGLE_CHAT_WINDOW, () => toggleChatWindow());
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.MINIMIZE_CHAT_WINDOW, () => minimizeChatWindow());
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.MAXIMIZE_CHAT_WINDOW, () => maximizeChatWindow());
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.POPUP_APP_MENU, () => getMainAppMenu().popup());
    // App
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.APP_CHECK_FOR_UPDATES, () => checkForUpdates());
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.APP_GET_VERSIONS, () => getVersions());
    // Model
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.DOWNLOAD_MODEL_BY_NAME, (_, name) => getModelManager().downloadModelByName(name));
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.REMOVE_MODEL_BY_NAME, (_, name) => getModelManager().removeModelByName(name));
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.DELETE_MODEL_BY_NAME, (_, name) => getModelManager().deleteModelByName(name));
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.DELETE_ALL_MODELS, () => getModelManager().deleteAllModels());
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.ADD_MODEL_FROM_FILE, () => getModelManager().addModelFromFile());
    // State
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.STATE_UPDATE_MODEL_STATE, () => (0, state_1.getStateManager)().updateModelState());
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.STATE_GET_FULL, () => (0, state_1.getStateManager)().store.store);
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.STATE_SET, (_, key, value) => (0, state_1.getStateManager)().store.set(key, value));
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.STATE_GET, (_, key) => (0, state_1.getStateManager)().store.get(key));
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.STATE_OPEN_IN_EDITOR, () => (0, state_1.getStateManager)().store.openInEditor());
    // Debug
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.DEBUG_STATE_GET_FULL, () => getDebugManager().store.store);
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.DEBUG_STATE_SET, (_, key, value) => getDebugManager().store.set(key, value));
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.DEBUG_STATE_GET, (_, key) => getDebugManager().store.get(key));
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.DEBUG_STATE_OPEN_IN_EDITOR, () => getDebugManager().store.openInEditor());
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.DEBUG_GET_DEBUG_INFO, () => getClippyDebugInfo());
    // Chat
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.CHAT_GET_CHAT_RECORDS, () => getChatManager().getChats());
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.CHAT_GET_CHAT_WITH_MESSAGES, (_, chatId) => getChatManager().getChatWithMessages(chatId));
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.CHAT_WRITE_CHAT_WITH_MESSAGES, (_, chatWithMessages) => getChatManager().writeChatWithMessages(chatWithMessages));
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.CHAT_DELETE_CHAT, (_, chatId) => getChatManager().deleteChat(chatId));
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.CHAT_DELETE_ALL_CHATS, () => getChatManager().deleteAllChats());
    // Clipboard
    electron_1.ipcMain.handle(ipc_messages_1.IpcMessages.CLIPBOARD_WRITE, (_, data) => electron_1.clipboard.write(data, "clipboard"));
    // Gemini - Placeholder until fully implemented with @google/generative-ai
    electron_1.ipcMain.on(ipc_messages_1.IpcMessages.GEMINI_PROMPT_STREAMING, async (event, data) => {
        console.log("Gemini prompt streaming not fully implemented yet.");
        event.reply(ipc_messages_1.IpcMessages.GEMINI_PROMPT_STREAMING_DONE);
    });
}
exports.setupIpcListeners = setupIpcListeners;
