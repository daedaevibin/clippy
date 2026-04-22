"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatManager = exports.ChatManager = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ChatManager {
    chatsIndexPath = path_1.default.join(electron_1.app.getPath("userData"), "chats", "chats.json");
    chatRecords = this.getChatsFromDisk();
    messageRecords = {};
    async getChatWithMessages(chatId) {
        if (this.messageRecords[chatId] && this.chatRecords[chatId]) {
            return {
                chat: this.chatRecords[chatId],
                messages: this.messageRecords[chatId],
            };
        }
        else {
            return this.getChatWithMessagesFromDisk(chatId);
        }
    }
    async writeChatWithMessages(chatWithMessages) {
        if (!chatWithMessages?.chat?.id) {
            console.error("writeChatWithMessages: malformed request", chatWithMessages);
            return;
        }
        if (chatWithMessages.messages.length === 0) {
            return;
        }
        this.chatRecords[chatWithMessages.chat.id] = chatWithMessages.chat;
        this.messageRecords[chatWithMessages.chat.id] = chatWithMessages.messages;
        await this.writeChatToDisk(chatWithMessages);
        await this.writeChatsIndexToDisk();
    }
    getChats() {
        return this.chatRecords;
    }
    async deleteChat(chatId) {
        delete this.chatRecords[chatId];
        delete this.messageRecords[chatId];
        await this.writeChatsIndexToDisk();
        await this.deleteChatFromDisk(chatId);
    }
    async deleteAllChats() {
        this.chatRecords = {};
        this.messageRecords = {};
        await this.deleteAllChatsFromDisk();
        await this.writeChatsIndexToDisk();
    }
    async writeChatsIndexToDisk() {
        try {
            await fs_1.default.promises.mkdir(this.getChatsPath(), { recursive: true });
            await fs_1.default.promises.writeFile(this.chatsIndexPath, JSON.stringify(this.chatRecords, null, 2));
        }
        catch (error) {
            console.error("Error writing chats index file:", error);
        }
    }
    async deleteAllChatsFromDisk() {
        const chatsPath = this.getChatsPath();
        try {
            if (fs_1.default.existsSync(chatsPath)) {
                await fs_1.default.promises.rm(chatsPath, { recursive: true, force: true });
            }
        }
        catch (error) {
            console.error("Error deleting all chats from disk:", error);
        }
    }
    async deleteChatFromDisk(chatId) {
        const chatPath = this.getChatPath(chatId);
        try {
            if (fs_1.default.existsSync(chatPath)) {
                await fs_1.default.promises.unlink(chatPath);
            }
        }
        catch (error) {
            console.error(`Error deleting chat file ${chatPath}:`, error);
        }
    }
    async writeChatToDisk(chatWithMessages) {
        const chatPath = this.getChatPath(chatWithMessages.chat.id);
        try {
            await fs_1.default.promises.mkdir(this.getChatsPath(), { recursive: true });
            await fs_1.default.promises.writeFile(chatPath, JSON.stringify(chatWithMessages, null, 2));
        }
        catch (error) {
            console.error(`Error writing chat file ${chatPath}:`, error);
        }
    }
    async getChatWithMessagesFromDisk(chatId) {
        const chatPath = this.getChatPath(chatId);
        if (!fs_1.default.existsSync(chatPath)) {
            return null;
        }
        try {
            const content = await fs_1.default.promises.readFile(chatPath, "utf8");
            const chatWithMessages = JSON.parse(content);
            // Update in-memory records
            this.messageRecords[chatId] = chatWithMessages.messages;
            return chatWithMessages;
        }
        catch (error) {
            console.error(`Error reading chat file ${chatPath}:`, error);
            return null;
        }
    }
    getChatsFromDisk() {
        let result = {};
        if (!fs_1.default.existsSync(this.chatsIndexPath)) {
            return result;
        }
        try {
            result = JSON.parse(fs_1.default.readFileSync(this.chatsIndexPath, "utf8"));
        }
        catch (error) {
            console.error("Error reading chats index file:", error);
        }
        return result;
    }
    getChatsPath() {
        return path_1.default.join(electron_1.app.getPath("userData"), "chats");
    }
    getChatPath(chatId) {
        return path_1.default.join(this.getChatsPath(), `${chatId}.json`);
    }
}
exports.ChatManager = ChatManager;
let _chatManager = null;
function getChatManager() {
    if (!_chatManager) {
        _chatManager = new ChatManager();
    }
    return _chatManager;
}
exports.getChatManager = getChatManager;
