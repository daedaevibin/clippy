"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_markdown_1 = __importDefault(require("react-markdown"));
const question_png_1 = __importDefault(require("../images/icons/question.png"));
const Default_png_1 = __importDefault(require("../images/animations/Default.png"));
function Message({ message }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "message", style: { display: "flex", alignItems: "flex-start", marginBottom: "8px" }, children: [(0, jsx_runtime_1.jsx)("img", { src: message.sender === "user" ? question_png_1.default : Default_png_1.default, alt: `${message.sender === "user" ? "You" : "Clippy"}`, style: { width: "24px", height: "24px", marginRight: "8px" } }), (0, jsx_runtime_1.jsxs)("div", { className: "message-content", style: { flex: 1 }, children: [message.thought && ((0, jsx_runtime_1.jsx)("div", { className: "thought-block", style: {
                            fontStyle: "italic",
                            color: "#666",
                            fontSize: "0.9em",
                            marginBottom: "4px",
                            paddingLeft: "8px",
                            borderLeft: "2px solid #ddd",
                            whiteSpace: "pre-wrap",
                        }, children: message.thought })), message.toolCalls && message.toolCalls.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "tool-calls", style: { marginBottom: "8px" }, children: message.toolCalls.map((call, index) => {
                            const result = message.toolResults?.find((r) => r.name === call.name);
                            return ((0, jsx_runtime_1.jsxs)("div", { className: "tool-call-block", style: {
                                    fontSize: "0.85em",
                                    backgroundColor: "#f0f0f0",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                    padding: "4px 8px",
                                    marginBottom: "4px",
                                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { fontWeight: "bold" }, children: [result ? "✓" : "⚡", " Executing ", call.name, "..."] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                            color: "#444",
                                            fontFamily: "monospace",
                                            fontSize: "0.8em",
                                        }, children: JSON.stringify(call.args) }), result && ((0, jsx_runtime_1.jsxs)("details", { style: { marginTop: "4px" }, children: [(0, jsx_runtime_1.jsx)("summary", { style: { cursor: "pointer", fontSize: "0.9em" }, children: "Result" }), (0, jsx_runtime_1.jsx)("pre", { style: {
                                                    maxHeight: "200px",
                                                    overflow: "auto",
                                                    backgroundColor: "#fff",
                                                    padding: "4px",
                                                    border: "1px solid #eee",
                                                    marginTop: "4px",
                                                    fontSize: "0.8em",
                                                }, children: String(result.result) })] }))] }, index));
                        }) })), message.children ? (message.children) : ((0, jsx_runtime_1.jsx)(react_markdown_1.default, { components: {
                            a: ({ node, ...props }) => ((0, jsx_runtime_1.jsx)("a", { target: "_blank", rel: "noopener noreferrer", ...props })),
                        }, children: message.content }))] })] }));
}
exports.Message = Message;
