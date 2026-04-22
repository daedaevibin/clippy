"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatInput = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ChatContext_1 = require("../contexts/ChatContext");
function ChatInput({ onSend, onAbort }) {
    const { status } = (0, ChatContext_1.useChat)();
    const [message, setMessage] = (0, react_1.useState)("");
    const { isModelLoaded } = (0, ChatContext_1.useChat)();
    const textareaRef = (0, react_1.useRef)(null);
    const handleSend = (0, react_1.useCallback)(() => {
        const trimmedMessage = message.trim();
        if (trimmedMessage) {
            onSend(trimmedMessage);
            setMessage("");
        }
    }, [message, onSend]);
    const handleAbort = (0, react_1.useCallback)(() => {
        setMessage("");
        onAbort();
    }, [onAbort]);
    const handleSendOrAbort = (0, react_1.useCallback)(() => {
        if (status === "responding") {
            handleAbort();
        }
        else {
            handleSend();
        }
    }, [status, handleSend, handleAbort]);
    const buttonStyle = {
        alignSelf: "flex-end",
        height: "23px",
    };
    (0, react_1.useEffect)(() => {
        if (isModelLoaded && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isModelLoaded]);
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            const trimmedMessage = message.trim();
            if (trimmedMessage) {
                onSend(trimmedMessage);
                setMessage("");
            }
            e.preventDefault();
            e.stopPropagation();
        }
    };
    const placeholder = isModelLoaded
        ? "Type a message, press Enter to send..."
        : "This is your chat input, we're just waiting for a model to load...";
    return ((0, jsx_runtime_1.jsxs)("div", { className: "field-row", style: { alignItems: "flex-end" }, children: [(0, jsx_runtime_1.jsx)("textarea", { rows: 1, ref: textareaRef, value: message, onChange: (e) => setMessage(e.target.value), disabled: !isModelLoaded, onKeyDown: handleKeyDown, placeholder: placeholder, className: "sunken-panel", style: {
                    flex: 1,
                    marginRight: "8px",
                    resize: "vertical",
                    minHeight: "23px",
                    width: 80,
                    border: "2px inset #dfdfdf",
                } }), (0, jsx_runtime_1.jsx)("button", { disabled: !isModelLoaded, style: buttonStyle, onClick: handleSendOrAbort, children: status === "responding" ? "Abort" : "Send" })] }));
}
exports.ChatInput = ChatInput;
