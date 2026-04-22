"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
require("./components/css/App.css");
require("98.css/dist/98.css");
require("./components/css/98.extended.css");
require("./components/css/Theme.css");
const Clippy_1 = require("./components/Clippy");
const ChatContext_1 = require("./contexts/ChatContext");
const BubbleWindow_1 = require("./components/BubbleWindow");
const SharedStateContext_1 = require("./contexts/SharedStateContext");
const BubbleViewContext_1 = require("./contexts/BubbleViewContext");
const DebugContext_1 = require("./contexts/DebugContext");
const WindowPortal_1 = require("./components/WindowPortal");
function App() {
    return ((0, jsx_runtime_1.jsx)(DebugContext_1.DebugProvider, { children: (0, jsx_runtime_1.jsx)(SharedStateContext_1.SharedStateProvider, { children: (0, jsx_runtime_1.jsx)(ChatContext_1.ChatProvider, { children: (0, jsx_runtime_1.jsx)(BubbleViewContext_1.BubbleViewProvider, { children: (0, jsx_runtime_1.jsxs)("div", { className: "clippy", style: {
                            position: "fixed",
                            bottom: 0,
                            right: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            justifyContent: "flex-end",
                            width: "100%",
                            height: "100%",
                        }, children: [(0, jsx_runtime_1.jsx)(Clippy_1.Clippy, {}), (0, jsx_runtime_1.jsx)(WindowPortal_1.WindowPortal, { width: 450, height: 650, children: (0, jsx_runtime_1.jsx)(BubbleWindow_1.Bubble, {}) })] }) }) }) }) }));
}
exports.App = App;
