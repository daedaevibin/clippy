"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLoadModelMessageContent = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const clippyApi_1 = require("../clippyApi");
const SharedStateContext_1 = require("../contexts/SharedStateContext");
const ErrorLoadModelMessageContent = ({ error }) => {
    const { settings } = (0, SharedStateContext_1.useSharedState)();
    const handleCopyDebugInfo = async () => {
        clippyApi_1.clippyApi.clipboardWrite({
            text: JSON.stringify({
                error,
                settings,
                state: await clippyApi_1.clippyApi.getDebugInfo(),
            }, null, 2),
        });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { children: ["Sadly, Clippy failed to successfully load the model. This could be an issue with Clippy itself, the selected model, or your system. You can report this error at", " ", (0, jsx_runtime_1.jsx)("a", { href: "https://github.com/felixrieseberg/clippy/issues", target: "_blank", children: "github.com/felixrieseberg/clippy/issues" }), ". Please include both the error message and the debug information."] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleCopyDebugInfo, children: "Copy error and debug info" }), (0, jsx_runtime_1.jsx)("p", { children: "The error was:" }), (0, jsx_runtime_1.jsx)("pre", { children: `${error}` })] }));
};
exports.ErrorLoadModelMessageContent = ErrorLoadModelMessageContent;
