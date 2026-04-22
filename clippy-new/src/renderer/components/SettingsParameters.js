"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsParameters = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const clippyApi_1 = require("../clippyApi");
const SharedStateContext_1 = require("../contexts/SharedStateContext");
const sharedState_1 = require("../../sharedState");
const SettingsParameters = () => {
    const { settings } = (0, SharedStateContext_1.useSharedState)();
    const [tempSystemPrompt, setTempSystemPrompt] = (0, react_1.useState)(settings.systemPrompt);
    const [tempTopK, setTempTopK] = (0, react_1.useState)(settings.topK);
    const [tempTemperature, setTempTemperature] = (0, react_1.useState)(settings.temperature);
    // Update settings on unmount so that the user editing preferences
    // doesn't rapidly reload the model
    (0, react_1.useEffect)(() => {
        return () => {
            const isNewSettings = tempSystemPrompt !== settings.systemPrompt ||
                tempTopK !== settings.topK ||
                tempTemperature !== settings.temperature;
            if (isNewSettings) {
                clippyApi_1.clippyApi.setState("settings", {
                    ...settings,
                    systemPrompt: tempSystemPrompt,
                    topK: tempTopK,
                    temperature: tempTemperature,
                });
            }
        };
    }, [tempSystemPrompt, tempTopK, tempTemperature]);
    const handleSystemPromptReset = (0, react_1.useCallback)(() => {
        const confirmed = window.confirm("Are you sure you want to reset the system prompt to the default? This will overwrite any customizations you have made.");
        if (confirmed) {
            setTempSystemPrompt(sharedState_1.DEFAULT_SYSTEM_PROMPT);
        }
    }, []);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("fieldset", { children: [(0, jsx_runtime_1.jsx)("legend", { children: "Prompts" }), (0, jsx_runtime_1.jsxs)("div", { className: "field-row-stacked", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "systemPrompt", children: "System Prompt. The key \"[LIST OF ANIMATIONS]\" will be automatically replaced by a full list of all available animations." }), (0, jsx_runtime_1.jsx)("textarea", { id: "systemPrompt", rows: 8, style: { resize: "vertical" }, value: tempSystemPrompt, onChange: (e) => {
                                    setTempSystemPrompt(e.target.value);
                                } })] }), (0, jsx_runtime_1.jsx)("div", { className: "field-row-stacked", children: (0, jsx_runtime_1.jsx)("button", { onClick: handleSystemPromptReset, style: { width: 100 }, children: "Reset" }) })] }), (0, jsx_runtime_1.jsxs)("fieldset", { style: { marginTop: "20px" }, children: [(0, jsx_runtime_1.jsx)("legend", { children: "Parameters" }), (0, jsx_runtime_1.jsxs)("div", { className: "field-row", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "topK", children: "Top K" }), (0, jsx_runtime_1.jsx)("input", { id: "topK", type: "number", value: tempTopK, step: "0.1", onChange: (e) => setTempTopK(parseFloat(e.target.value)) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "field-row", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "temperature", children: "Temperature" }), (0, jsx_runtime_1.jsx)("input", { id: "temperature", type: "number", value: tempTemperature, step: "0.1", onChange: (e) => setTempTemperature(parseFloat(e.target.value)) })] })] })] }));
};
exports.SettingsParameters = SettingsParameters;
