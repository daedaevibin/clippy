"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsAbout = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const clippyApi_1 = require("../clippyApi");
const SettingsAbout = () => {
    const [versions, setVersions] = (0, react_1.useState)({});
    (0, react_1.useEffect)(() => {
        clippyApi_1.clippyApi.getVersions().then((versions) => {
            setVersions(versions);
        });
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { children: "About" }), (0, jsx_runtime_1.jsxs)("fieldset", { children: [(0, jsx_runtime_1.jsx)("legend", { children: "Version" }), (0, jsx_runtime_1.jsxs)("p", { children: ["Clippy ", (0, jsx_runtime_1.jsx)("code", { children: versions.clippy || "Unknown" }), " (with Electron", " ", (0, jsx_runtime_1.jsx)("code", { children: versions.electron || "Unknown" }), " and Node-llama-cpp:", " ", (0, jsx_runtime_1.jsxs)("code", { children: [versions.nodeLlamaCpp || "Unknown", ")"] })] })] }), (0, jsx_runtime_1.jsxs)("p", { children: ["This app is a love letter and homage to the late, great Clippy, the assistant from Microsoft Office 1997. It is ", (0, jsx_runtime_1.jsx)("i", { children: "not" }), " affiliated, approved, or supported by Microsoft. Consider it software art. If you don't like it, consider it software satire."] }), (0, jsx_runtime_1.jsx)("h3", { children: "Acknowledgments" }), (0, jsx_runtime_1.jsxs)("p", { children: ["This app was made by", " ", (0, jsx_runtime_1.jsx)("a", { href: "https://github.com/felixrieseberg", target: "_blank", children: "Felix Rieseberg" }), " ", "using", " ", (0, jsx_runtime_1.jsx)("a", { href: "https://electronjs.org/", target: "_blank", children: "Electron" }), " ", "and", " ", (0, jsx_runtime_1.jsx)("a", { href: "https://node-llama-cpp.withcat.ai/", target: "_blank", children: "node-llama-cpp" }), ", embedded using", " ", (0, jsx_runtime_1.jsx)("a", { href: "https://github.com/electron/llm", target: "_blank", children: "@electron/llm" }), ". The whimsical retro design was made possible by", " ", (0, jsx_runtime_1.jsx)("a", { href: "https://github.com/jdan", target: "_blank", children: "Jordan Scales" }), ". Quantized GGUF models provided by", " ", (0, jsx_runtime_1.jsx)("a", { href: "https://www.unsloth.ai", target: "_blank", children: "Unsloth" }), "."] }), (0, jsx_runtime_1.jsxs)("p", { children: ["The character was designed by illustrator", " ", (0, jsx_runtime_1.jsx)("a", { href: "https://www.kevanatteberry.com/", target: "_blank", children: "Kevan Atteberry" }), ", who created more than 15 potential characters for Microsoft's Office Assistants. \"He's a guy that just wants to help, and he's a little bit too helpful sometimes \u2014 and there's something fun and vulnerable about that.\", he once said about Clippy."] }), (0, jsx_runtime_1.jsx)("p", { children: "Clippy and all visual assets related to Clippy are owned by Microsoft. This app is not affiliated with Microsoft." })] }));
};
exports.SettingsAbout = SettingsAbout;
