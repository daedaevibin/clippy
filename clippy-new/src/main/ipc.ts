import { clipboard, ipcMain, app } from "electron";
import { IpcMessages } from "../ipc-messages";
import { getStateManager } from "./state";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

// Mock imports for now until these are implemented
const toggleChatWindow = () => {};
const maximizeChatWindow = () => {};
const minimizeChatWindow = () => {};
const getModelManager = () => ({
  downloadModelByName: (name: string) => {},
  removeModelByName: (name: string) => {},
  deleteModelByName: (name: string) => {},
  deleteAllModels: () => {},
  addModelFromFile: () => {},
});
const getChatManager = () => ({
  getChats: () => {},
  getChatWithMessages: (chatId: string) => {},
  writeChatWithMessages: (chat: any) => {},
  deleteChat: (chatId: string) => {},
  deleteAllChats: () => {},
});
const getMainAppMenu = () => ({ popup: () => {} });
const checkForUpdates = () => {};
const getVersions = () => ({});
const getClippyDebugInfo = () => ({});
const getDebugManager = () => ({
  store: {
    store: {},
    set: (key: string, value: any) => {},
    get: (key: string) => {},
    openInEditor: () => {},
  },
});

export function setupIpcListeners() {
  // Window
  ipcMain.handle(IpcMessages.TOGGLE_CHAT_WINDOW, () => toggleChatWindow());
  ipcMain.handle(IpcMessages.MINIMIZE_CHAT_WINDOW, () => minimizeChatWindow());
  ipcMain.handle(IpcMessages.MAXIMIZE_CHAT_WINDOW, () => maximizeChatWindow());
  ipcMain.handle(IpcMessages.POPUP_APP_MENU, () => getMainAppMenu().popup());

  // App
  ipcMain.handle(IpcMessages.APP_CHECK_FOR_UPDATES, () => checkForUpdates());
  ipcMain.handle(IpcMessages.APP_GET_VERSIONS, () => getVersions());

  // Model
  ipcMain.handle(IpcMessages.DOWNLOAD_MODEL_BY_NAME, (_, name: string) =>
    getModelManager().downloadModelByName(name),
  );
  ipcMain.handle(IpcMessages.REMOVE_MODEL_BY_NAME, (_, name: string) =>
    getModelManager().removeModelByName(name),
  );
  ipcMain.handle(IpcMessages.DELETE_MODEL_BY_NAME, (_, name: string) =>
    getModelManager().deleteModelByName(name),
  );
  ipcMain.handle(IpcMessages.DELETE_ALL_MODELS, () =>
    getModelManager().deleteAllModels(),
  );
  ipcMain.handle(IpcMessages.ADD_MODEL_FROM_FILE, () =>
    getModelManager().addModelFromFile(),
  );

  // State
  ipcMain.handle(IpcMessages.STATE_UPDATE_MODEL_STATE, () =>
    getStateManager().updateModelState(),
  );
  ipcMain.handle(
    IpcMessages.STATE_GET_FULL,
    () => (getStateManager().store as any).store,
  );
  ipcMain.handle(IpcMessages.STATE_SET, (_, key: string, value: any) =>
    (getStateManager().store as any).set(key, value),
  );
  ipcMain.handle(IpcMessages.STATE_GET, (_, key: string) =>
    (getStateManager().store as any).get(key),
  );
  ipcMain.handle(IpcMessages.STATE_OPEN_IN_EDITOR, () =>
    (getStateManager().store as any).openInEditor(),
  );

  // Debug
  ipcMain.handle(
    IpcMessages.DEBUG_STATE_GET_FULL,
    () => getDebugManager().store.store,
  );
  ipcMain.handle(IpcMessages.DEBUG_STATE_SET, (_, key: string, value: any) =>
    getDebugManager().store.set(key, value),
  );
  ipcMain.handle(IpcMessages.DEBUG_STATE_GET, (_, key: string) =>
    getDebugManager().store.get(key),
  );
  ipcMain.handle(IpcMessages.DEBUG_STATE_OPEN_IN_EDITOR, () =>
    getDebugManager().store.openInEditor(),
  );
  ipcMain.handle(IpcMessages.DEBUG_GET_DEBUG_INFO, () => getClippyDebugInfo());

  // Chat
  ipcMain.handle(IpcMessages.CHAT_GET_CHAT_RECORDS, () =>
    getChatManager().getChats(),
  );
  ipcMain.handle(IpcMessages.CHAT_GET_CHAT_WITH_MESSAGES, (_, chatId: string) =>
    getChatManager().getChatWithMessages(chatId),
  );
  ipcMain.handle(
    IpcMessages.CHAT_WRITE_CHAT_WITH_MESSAGES,
    (_, chatWithMessages: any) =>
      getChatManager().writeChatWithMessages(chatWithMessages),
  );
  ipcMain.handle(IpcMessages.CHAT_DELETE_CHAT, (_, chatId: string) =>
    getChatManager().deleteChat(chatId),
  );
  ipcMain.handle(IpcMessages.CHAT_DELETE_ALL_CHATS, () =>
    getChatManager().deleteAllChats(),
  );

  // Clipboard
  ipcMain.handle(IpcMessages.CLIPBOARD_WRITE, (_, data: any) =>
    clipboard.write(data, "clipboard"),
  );

  // Gemini - Placeholder until fully implemented with @google/generative-ai
  ipcMain.on(IpcMessages.GEMINI_PROMPT_STREAMING, async (event, data) => {
    console.log("Gemini prompt streaming not fully implemented yet.");
    event.reply(IpcMessages.GEMINI_PROMPT_STREAMING_DONE);
  });
}
