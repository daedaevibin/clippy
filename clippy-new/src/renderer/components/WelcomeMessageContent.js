"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelcomeMessageContent = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const BubbleViewContext_1 = require("../contexts/BubbleViewContext");
const SharedStateContext_1 = require("../contexts/SharedStateContext");
const Progress_1 = require("./Progress");
const model_helpers_1 = require("../../helpers/model-helpers");
const convert_download_speed_1 = require("../helpers/convert-download-speed");
const WelcomeMessageContent = () => {
    const { setCurrentView } = (0, BubbleViewContext_1.useBubbleView)();
    const { models } = (0, SharedStateContext_1.useSharedState)();
    // Find if any model is currently downloading
    const downloadingModel = Object.values(models || {}).find(model_helpers_1.isModelDownloading);
    // Check if any model is ready
    const readyModel = Object.values(models || {}).find(model_helpers_1.isModelReady);
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Welcome to Clippy!" }), (0, jsx_runtime_1.jsxs)("p", { children: ["This little app is a love letter and homage to the late, great Clippy, the assistant from Microsoft Office 1997. The character was designed by illustrator Kevan Atteberry, who created more than 15 potential characters for Microsoft's Office Assistants. It is ", (0, jsx_runtime_1.jsx)("i", { children: "not" }), " ", "affiliated, approved, or supported by Microsoft. Consider it software art or satire."] }), (0, jsx_runtime_1.jsx)("p", { children: "Clippy can run a Large Language Model (LLM) locally, so that you can chat with it offline, or use an API-based model like Google Gemini." }), (0, jsx_runtime_1.jsxs)("p", { children: ["To get started, please go to the ", (0, jsx_runtime_1.jsx)("strong", { children: "Model Settings" }), " to choose how you want to use Clippy:"] }), (0, jsx_runtime_1.jsxs)("ul", { children: [(0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Self-hosted:" }), " Download and run models like Gemma 3 or Llama 3 directly on your computer. No internet required after download!"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "API-based:" }), " Use Google's Gemini models. This requires an internet connection and a Gemini API key."] })] }), (0, jsx_runtime_1.jsx)("p", { children: "By the way, you can open or close this chat window by clicking right on Clippy's head." }), downloadingModel && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: "15px", marginBottom: "15px" }, children: [(0, jsx_runtime_1.jsxs)("p", { children: ["Downloading ", downloadingModel.name, "... (", (0, convert_download_speed_1.prettyDownloadSpeed)(downloadingModel.downloadState?.currentBytesPerSecond || 0), "/s)"] }), (0, jsx_runtime_1.jsx)(Progress_1.Progress, { progress: downloadingModel.downloadState?.percentComplete || 0 })] })), !downloadingModel && readyModel && ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: "15px", marginBottom: "15px" }, children: (0, jsx_runtime_1.jsxs)("p", { style: { color: "green", fontWeight: "bold" }, children: ["\u2713 ", readyModel.name, " is ready! You can now start chatting with Clippy."] }) })), (0, jsx_runtime_1.jsx)("button", { onClick: () => setCurrentView("settings-model"), children: "Open Model Settings" })] }));
};
exports.WelcomeMessageContent = WelcomeMessageContent;
