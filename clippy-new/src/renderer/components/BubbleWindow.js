"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bubble = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const clippyApi_1 = require("../clippyApi");
const Chat_1 = require("./Chat");
const Settings_1 = require("./Settings");
const BubbleViewContext_1 = require("../contexts/BubbleViewContext");
const Chats_1 = require("./Chats");
function Bubble() {
    const { currentView, setCurrentView } = (0, BubbleViewContext_1.useBubbleView)();
    const [isMaximized, setIsMaximized] = (0, react_1.useState)(false);
    const containerStyle = {
        width: "calc(100% - 6px)",
        height: "calc(100% - 6px)",
        margin: 0,
        overflow: "hidden",
    };
    const chatStyle = {
        padding: "15px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        minHeight: "calc(100% - 35px)",
        overflowAnchor: "none",
    };
    const scrollAnchoredAtBottomStyle = {
        display: "flex",
        flexDirection: "column-reverse",
    };
    let content = null;
    if (currentView === "chat") {
        content = (0, jsx_runtime_1.jsx)(Chat_1.Chat, { style: chatStyle });
    }
    else if (currentView.startsWith("settings")) {
        content = (0, jsx_runtime_1.jsx)(Settings_1.Settings, { onClose: () => setCurrentView("chat") });
    }
    else if (currentView === "chats") {
        content = (0, jsx_runtime_1.jsx)(Chats_1.Chats, { onClose: () => setCurrentView("chat") });
    }
    const handleSettingsClick = (0, react_1.useCallback)(() => {
        if (currentView.startsWith("settings")) {
            setCurrentView("chat");
        }
        else {
            setCurrentView("settings");
        }
    }, [setCurrentView, currentView]);
    const handleChatsClick = (0, react_1.useCallback)(() => {
        if (currentView === "chats") {
            setCurrentView("chat");
        }
        else {
            setCurrentView("chats");
        }
    }, [setCurrentView, currentView]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bubble-container window", style: containerStyle, children: [(0, jsx_runtime_1.jsxs)("div", { className: "app-drag title-bar", children: [(0, jsx_runtime_1.jsx)("div", { className: "title-bar-text", children: "Chat with Clippy" }), (0, jsx_runtime_1.jsxs)("div", { className: "title-bar-controls app-no-drag", children: [(0, jsx_runtime_1.jsx)("button", { style: {
                                    marginRight: "8px",
                                    paddingLeft: "8px",
                                    paddingRight: "8px",
                                }, onClick: handleChatsClick, children: "Chats" }), (0, jsx_runtime_1.jsx)("button", { style: {
                                    marginRight: "8px",
                                    paddingLeft: "8px",
                                    paddingRight: "8px",
                                }, onClick: handleSettingsClick, children: "Settings" }), (0, jsx_runtime_1.jsx)("button", { "aria-label": "Minimize", onClick: () => clippyApi_1.clippyApi.minimizeChatWindow() }), (0, jsx_runtime_1.jsx)("button", { "aria-label": isMaximized ? "Restore" : "Maximize", onClick: () => {
                                    clippyApi_1.clippyApi.maximizeChatWindow();
                                    setIsMaximized(!isMaximized);
                                } }), (0, jsx_runtime_1.jsx)("button", { "aria-label": "Close", onClick: () => clippyApi_1.clippyApi.toggleChatWindow() })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "window-content", style: currentView === "chat" ? scrollAnchoredAtBottomStyle : {}, children: (0, jsx_runtime_1.jsx)("div", { className: "window-body", children: content }) })] }));
}
exports.Bubble = Bubble;
