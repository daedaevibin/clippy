"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsAdvanced = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const clippyApi_1 = require("../clippyApi");
const SharedStateContext_1 = require("../contexts/SharedStateContext");
const Checkbox_1 = require("./Checkbox");
const SettingsAdvanced = () => {
    const { settings } = (0, SharedStateContext_1.useSharedState)();
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("fieldset", { children: [(0, jsx_runtime_1.jsx)("legend", { children: "Automatic Updates" }), (0, jsx_runtime_1.jsx)(Checkbox_1.Checkbox, { id: "autoUpdates", label: "Automatically keep Clippy up to date", checked: !settings.disableAutoUpdate, onChange: (checked) => {
                            clippyApi_1.clippyApi.setState("settings.disableAutoUpdate", !checked);
                        } }), (0, jsx_runtime_1.jsx)("button", { style: { marginTop: "10px" }, onClick: () => clippyApi_1.clippyApi.checkForUpdates(), children: "Check for Updates" })] }), (0, jsx_runtime_1.jsxs)("fieldset", { children: [(0, jsx_runtime_1.jsx)("legend", { children: "Configuration" }), (0, jsx_runtime_1.jsx)("p", { children: "Clippy keeps its configuration in JSON files. Click these buttons to open them in your default JSON editor. After editing, restart Clippy to apply the changes." }), (0, jsx_runtime_1.jsx)("button", { onClick: clippyApi_1.clippyApi.openStateInEditor, children: "Open Configuration File" }), (0, jsx_runtime_1.jsx)("button", { onClick: clippyApi_1.clippyApi.openDebugStateInEditor, children: "Open Debug File" })] }), (0, jsx_runtime_1.jsxs)("fieldset", { children: [(0, jsx_runtime_1.jsx)("legend", { children: "Delete All Models" }), (0, jsx_runtime_1.jsx)("p", { children: "This will delete all models from Clippy. This action is not reversible." }), (0, jsx_runtime_1.jsx)("button", { onClick: clippyApi_1.clippyApi.deleteAllModels, children: "Delete All Models" })] })] }));
};
exports.SettingsAdvanced = SettingsAdvanced;
