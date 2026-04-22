"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsAppearance = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const sharedState_1 = require("../../sharedState");
const clippyApi_1 = require("../clippyApi");
const SharedStateContext_1 = require("../contexts/SharedStateContext");
const Checkbox_1 = require("./Checkbox");
const SettingsAppearance = () => {
    const { settings } = (0, SharedStateContext_1.useSharedState)();
    const onChangeFontSize = (event) => {
        const newSize = parseInt(event.target.value, 10);
        if (!isNaN(newSize)) {
            clippyApi_1.clippyApi.setState("settings.defaultFontSize", newSize);
        }
    };
    const onReset = () => {
        const defaultAppareanceSettings = {
            defaultFont: sharedState_1.DEFAULT_SETTINGS.defaultFont,
            defaultFontSize: sharedState_1.DEFAULT_SETTINGS.defaultFontSize,
            clippyAlwaysOnTop: sharedState_1.DEFAULT_SETTINGS.clippyAlwaysOnTop,
            chatAlwaysOnTop: sharedState_1.DEFAULT_SETTINGS.chatAlwaysOnTop,
            alwaysOpenChat: sharedState_1.DEFAULT_SETTINGS.alwaysOpenChat,
        };
        for (const key in defaultAppareanceSettings) {
            clippyApi_1.clippyApi.setState(`settings.${key}`, defaultAppareanceSettings[key]);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("fieldset", { children: [(0, jsx_runtime_1.jsx)("legend", { children: "Window Options" }), (0, jsx_runtime_1.jsx)(Checkbox_1.Checkbox, { id: "clippyAlwaysOnTop", label: "Keep Clippy always on top of all other windows", checked: settings.clippyAlwaysOnTop, onChange: (checked) => {
                            clippyApi_1.clippyApi.setState("settings.clippyAlwaysOnTop", checked);
                        } }), (0, jsx_runtime_1.jsx)(Checkbox_1.Checkbox, { id: "chatAlwaysOnTop", label: "Keep chat always on top of all other windows", checked: settings.chatAlwaysOnTop, onChange: (checked) => {
                            clippyApi_1.clippyApi.setState("settings.chatAlwaysOnTop", checked);
                        } }), (0, jsx_runtime_1.jsx)(Checkbox_1.Checkbox, { id: "alwaysOpenChat", label: "Always open chat when Clippy starts", checked: settings.alwaysOpenChat, onChange: (checked) => {
                            clippyApi_1.clippyApi.setState("settings.alwaysOpenChat", checked);
                        } })] }), (0, jsx_runtime_1.jsxs)("fieldset", { children: [(0, jsx_runtime_1.jsx)("legend", { children: "Font Options" }), (0, jsx_runtime_1.jsxs)("div", { className: "field-row", style: { width: 300 }, children: [(0, jsx_runtime_1.jsx)("label", { style: { width: 100 }, children: "Font size:" }), (0, jsx_runtime_1.jsx)("label", { children: "8px" }), (0, jsx_runtime_1.jsx)("input", { type: "range", min: "8", max: "20", step: 1, value: settings.defaultFontSize, onChange: onChangeFontSize }), (0, jsx_runtime_1.jsx)("label", { children: "20px" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "field-row", style: { width: 300 }, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "defaultFont", style: { width: 58 }, children: "Font:" }), (0, jsx_runtime_1.jsxs)("select", { id: "defaultFont", value: settings.defaultFont, onChange: (event) => {
                                    clippyApi_1.clippyApi.setState("settings.defaultFont", event.target.value);
                                }, children: [(0, jsx_runtime_1.jsx)("option", { value: "Pixelated MS Sans Serif", children: "Pixelated MS Sans Serif" }), (0, jsx_runtime_1.jsx)("option", { value: "Comic Sans MS", children: "Comic Sans MS" }), (0, jsx_runtime_1.jsx)("option", { value: "Tahoma", children: "Tahoma" }), (0, jsx_runtime_1.jsx)("option", { value: "System Default", children: "System Default" })] })] })] }), (0, jsx_runtime_1.jsx)("button", { style: { marginTop: 10 }, onClick: onReset, children: "Reset" })] }));
};
exports.SettingsAppearance = SettingsAppearance;
