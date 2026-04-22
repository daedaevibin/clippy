"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chats = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ChatContext_1 = require("../contexts/ChatContext");
const TableView_1 = require("./TableView");
const date_fns_1 = require("date-fns");
const react_1 = require("react");
const Chats = ({ onClose }) => {
    const { chatRecords, currentChatRecord, selectChat, deleteChat, deleteAllChats, } = (0, ChatContext_1.useChat)();
    const [isDeleting, setIsDeleting] = (0, react_1.useState)(false);
    const [selectedChatIndex, setSelectedChatIndex] = (0, react_1.useState)(null);
    const chatsWithPreview = Object.values(chatRecords).map((chat) => ({
        id: chat.id,
        lastUpdated: (0, date_fns_1.formatDistance)(chat.updatedAt, new Date(), {
            addSuffix: true,
        }),
        preview: chat.preview,
    }));
    const handleSelectChat = async (index) => {
        setSelectedChatIndex(index);
    };
    const handleRestoreChat = async () => {
        if (selectedChatIndex === null ||
            selectedChatIndex >= chatsWithPreview.length) {
            return;
        }
        selectChat(chatsWithPreview[selectedChatIndex].id);
        onClose();
    };
    const handleDeleteChat = async (chatId) => {
        if (!confirm("Are you sure you want to delete this chat?")) {
            return;
        }
        setIsDeleting(true);
        try {
            await deleteChat(chatId);
            setSelectedChatIndex(null);
        }
        catch (error) {
            console.error("Failed to delete chat:", error);
        }
        finally {
            setIsDeleting(false);
        }
    };
    const handleDeleteSelected = async () => {
        if (selectedChatIndex === null ||
            selectedChatIndex >= chatsWithPreview.length) {
            return;
        }
        const chatId = chatsWithPreview[selectedChatIndex].id;
        await handleDeleteChat(chatId);
    };
    const handleDeleteAllChats = async () => {
        if (!confirm("Are you sure you want to delete ALL chats? This cannot be undone.")) {
            return;
        }
        setIsDeleting(true);
        try {
            await deleteAllChats();
            setSelectedChatIndex(null);
        }
        catch (error) {
            console.error("Failed to delete all chats:", error);
        }
        finally {
            setIsDeleting(false);
        }
    };
    const columns = [
        { key: "preview", header: "Preview" },
        { key: "lastUpdated", header: "Last Updated" },
    ];
    return ((0, jsx_runtime_1.jsxs)("div", { className: "chats-container", style: {
            padding: "16px",
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }, children: [(0, jsx_runtime_1.jsx)("h1", { children: "Chats" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", gap: "8px" }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleRestoreChat, disabled: selectedChatIndex === null, children: "Restore Chat" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleDeleteSelected, disabled: isDeleting || selectedChatIndex === null, children: "Delete Selected" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleDeleteAllChats, disabled: isDeleting, children: "Delete All Chats" })] })] }), (0, jsx_runtime_1.jsx)(TableView_1.TableView, { columns: columns, data: chatsWithPreview, onRowSelect: handleSelectChat, style: { height: "calc(80vh - 100px)", overflow: "auto" }, initialSelectedIndex: Object.values(chatRecords).findIndex((chat) => chat.id === currentChatRecord.id) })] }));
};
exports.Chats = Chats;
