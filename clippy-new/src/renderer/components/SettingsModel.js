"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsModel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const TableView_1 = require("./TableView");
const Progress_1 = require("./Progress");
const react_1 = require("react");
const SharedStateContext_1 = require("../contexts/SharedStateContext");
const clippyApi_1 = require("../clippyApi");
const convert_download_speed_1 = require("../helpers/convert-download-speed");
const model_helpers_1 = require("../../helpers/model-helpers");
const SettingsModel = () => {
    const { models, settings } = (0, SharedStateContext_1.useSharedState)();
    const [selectedIndex, setSelectedIndex] = (0, react_1.useState)(0);
    const columns = [
        { key: "default", header: "Loaded", width: 50 },
        { key: "name", header: "Name" },
        {
            key: "size",
            header: "Size",
            render: (row) => row.size ? `${row.size.toLocaleString()} MB` : "API",
        },
        { key: "company", header: "Company" },
        { key: "downloaded", header: "Downloaded" },
    ];
    const modelKeys = Object.keys(models || {});
    const data = modelKeys.map((modelKey) => {
        const model = models?.[modelKey];
        return {
            default: model?.name === settings.selectedModel ? "ｘ" : "",
            name: model?.name,
            company: model?.company,
            size: model?.size,
            downloaded: model?.downloaded ? "Yes" : "No",
        };
    });
    // Variables
    const selectedModel = models?.[modelKeys[selectedIndex]] || null;
    const isDownloading = (0, model_helpers_1.isModelDownloading)(selectedModel);
    const isDefaultModel = selectedModel?.name === settings.selectedModel;
    // Handlers
    // ---------------------------------------------------------------------------
    const handleRowSelect = (index) => {
        setSelectedIndex(index);
    };
    const handleDownload = async () => {
        if (selectedModel) {
            await clippyApi_1.clippyApi.downloadModelByName(data[selectedIndex].name);
        }
    };
    const handleDeleteOrRemove = async () => {
        if (selectedModel?.imported) {
            await clippyApi_1.clippyApi.removeModelByName(selectedModel.name);
        }
        else if (selectedModel) {
            await clippyApi_1.clippyApi.deleteModelByName(selectedModel.name);
        }
    };
    const handleMakeDefault = async () => {
        if (selectedModel) {
            clippyApi_1.clippyApi.setState("settings.selectedModel", selectedModel.name);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { children: ["Select the model you want to use for your chat. You can either", " ", (0, jsx_runtime_1.jsx)("strong", { children: "self-host" }), " a model (run it locally on your machine) or use an ", (0, jsx_runtime_1.jsx)("strong", { children: "API-based" }), " model (like Google Gemini)."] }), (0, jsx_runtime_1.jsxs)("fieldset", { style: { marginBottom: "15px" }, children: [(0, jsx_runtime_1.jsx)("legend", { children: "Gemini API" }), (0, jsx_runtime_1.jsxs)("div", { className: "field-row", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "gemini-api-key", children: "API Key:" }), (0, jsx_runtime_1.jsx)("input", { id: "gemini-api-key", type: "password", placeholder: "Enter your Gemini API key...", value: settings.geminiApiKey || "", onChange: (e) => clippyApi_1.clippyApi.setState("settings.geminiApiKey", e.target.value) })] }), (0, jsx_runtime_1.jsxs)("p", { style: { fontSize: "11px", marginTop: "5px" }, children: ["Required for Gemini models. You can get a key from the", " ", (0, jsx_runtime_1.jsx)("a", { href: "https://aistudio.google.com/", target: "_blank", children: "Google AI Studio" }), "."] })] }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: "10px" }, children: (0, jsx_runtime_1.jsx)("strong", { children: "Available Models:" }) }), (0, jsx_runtime_1.jsx)("button", { style: { marginBottom: 10 }, onClick: () => clippyApi_1.clippyApi.addModelFromFile(), children: "Add local model from file (.gguf)" }), (0, jsx_runtime_1.jsx)(TableView_1.TableView, { columns: columns, data: data, onRowSelect: handleRowSelect, initialSelectedIndex: selectedIndex }), selectedModel && ((0, jsx_runtime_1.jsxs)("div", { className: "model-details sunken-panel", style: { marginTop: "20px", padding: "15px" }, children: [(0, jsx_runtime_1.jsx)("strong", { children: selectedModel.name }), selectedModel.description && (0, jsx_runtime_1.jsx)("p", { children: selectedModel.description }), selectedModel.homepage && ((0, jsx_runtime_1.jsx)("p", { children: (0, jsx_runtime_1.jsx)("a", { href: selectedModel.homepage, target: "_blank", rel: "noopener noreferrer", children: "Visit Homepage" }) })), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: "15px", display: "flex", gap: "10px" }, children: !selectedModel.downloaded &&
                            !selectedModel.name.startsWith("Gemini") ? ((0, jsx_runtime_1.jsx)("button", { disabled: isDownloading, onClick: handleDownload, children: "Download Model" })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { disabled: isDownloading || isDefaultModel, onClick: handleMakeDefault, children: isDefaultModel
                                        ? "Clippy uses this model"
                                        : "Make Clippy use this model" }), !selectedModel.name.startsWith("Gemini") && ((0, jsx_runtime_1.jsxs)("button", { onClick: handleDeleteOrRemove, children: [selectedModel?.imported ? "Remove" : "Delete", " Model"] }))] })) }), (0, jsx_runtime_1.jsx)(SettingsModelDownload, { model: selectedModel })] }))] }));
};
exports.SettingsModel = SettingsModel;
const SettingsModelDownload = ({ model }) => {
    if (!model || !(0, model_helpers_1.isModelDownloading)(model)) {
        return null;
    }
    const downloadSpeed = (0, convert_download_speed_1.prettyDownloadSpeed)(model?.downloadState?.currentBytesPerSecond || 0);
    return ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: "15px" }, children: [(0, jsx_runtime_1.jsxs)("p", { children: ["Downloading ", model.name, "... (", downloadSpeed, "/s)"] }), (0, jsx_runtime_1.jsx)(Progress_1.Progress, { progress: model.downloadState?.percentComplete || 0 })] }));
};
