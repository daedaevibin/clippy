"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsSkills = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const SharedStateContext_1 = require("../contexts/SharedStateContext");
const clippyApi_1 = require("../clippyApi");
const Checkbox_1 = require("./Checkbox");
const SettingsSkills = () => {
    const { settings } = (0, SharedStateContext_1.useSharedState)();
    const handleTerminalToggle = async (enabled) => {
        if (enabled) {
            const confirmed = window.confirm("Warning: Enabling terminal access allows the AI to execute commands on your system. This can be dangerous. Are you sure you want to enable this?");
            if (!confirmed)
                return;
        }
        clippyApi_1.clippyApi.setState("settings.enableTerminalAccess", enabled);
    };
    const handleFileToggle = async (enabled) => {
        if (enabled) {
            const confirmed = window.confirm("Warning: Enabling file access allows the AI to read and write files on your system. Are you sure you want to enable this?");
            if (!confirmed)
                return;
        }
        clippyApi_1.clippyApi.setState("settings.enableFileAccess", enabled);
    };
    const handleRootToggle = async (enabled) => {
        if (enabled) {
            const confirmed = window.confirm("Warning: Allowing root access allows the AI to access ANY file on your system, including system files. This is highly risky. Are you sure?");
            if (!confirmed)
                return;
        }
        clippyApi_1.clippyApi.setState("settings.allowRootAccess", enabled);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: "10px" }, children: [(0, jsx_runtime_1.jsx)("p", { children: "Enable additional capabilities (Skills) for the Gemini models. These allow Clippy to interact with your system more directly." }), (0, jsx_runtime_1.jsxs)("fieldset", { children: [(0, jsx_runtime_1.jsx)("legend", { children: "System Skills" }), (0, jsx_runtime_1.jsx)("div", { className: "field-row", children: (0, jsx_runtime_1.jsx)(Checkbox_1.Checkbox, { id: "enable-terminal", label: "Enable Terminal Access (Execute Commands)", checked: !!settings.enableTerminalAccess, onChange: handleTerminalToggle }) }), (0, jsx_runtime_1.jsx)("div", { className: "field-row", children: (0, jsx_runtime_1.jsx)(Checkbox_1.Checkbox, { id: "enable-file", label: "Enable File System Access (Read/Write Files)", checked: !!settings.enableFileAccess, onChange: handleFileToggle }) })] }), (0, jsx_runtime_1.jsxs)("fieldset", { style: { marginTop: "15px" }, children: [(0, jsx_runtime_1.jsx)("legend", { children: "Security & Permissions" }), (0, jsx_runtime_1.jsx)("div", { className: "field-row", children: (0, jsx_runtime_1.jsx)(Checkbox_1.Checkbox, { id: "allow-root", label: "Allow Root Directory (/) Access", checked: !!settings.allowRootAccess, disabled: !settings.enableFileAccess, onChange: handleRootToggle }) }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: "11px", color: "#666", marginTop: "5px" }, children: "By default, file access is restricted to your user directory if root access is disabled." })] })] }));
};
exports.SettingsSkills = SettingsSkills;
