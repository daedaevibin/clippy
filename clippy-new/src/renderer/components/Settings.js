"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const TabList_1 = require("./TabList");
const BubbleViewContext_1 = require("../contexts/BubbleViewContext");
const SettingsModel_1 = require("./SettingsModel");
const BubbleWindowBottomBar_1 = require("./BubbleWindowBottomBar");
const SettingsAdvanced_1 = require("./SettingsAdvanced");
const SettingsAppearance_1 = require("./SettingsAppearance");
const SettingsAbout_1 = require("./SettingsAbout");
const SettingsParameters_1 = require("./SettingsParameters");
const SettingsSkills_1 = require("./SettingsSkills");
const Settings = ({ onClose }) => {
    const { currentView, setCurrentView } = (0, BubbleViewContext_1.useBubbleView)();
    const [activeTab, setActiveTab] = (0, react_1.useState)(bubbleViewToSettingsTab(currentView));
    (0, react_1.useEffect)(() => {
        const newTab = bubbleViewToSettingsTab(currentView);
        if (newTab !== activeTab) {
            setActiveTab(newTab);
        }
    }, [currentView, activeTab]);
    const tabs = [
        { label: "Appearance", key: "appearance", content: (0, jsx_runtime_1.jsx)(SettingsAppearance_1.SettingsAppearance, {}) },
        { label: "Model", key: "model", content: (0, jsx_runtime_1.jsx)(SettingsModel_1.SettingsModel, {}) },
        { label: "Parameters", key: "parameters", content: (0, jsx_runtime_1.jsx)(SettingsParameters_1.SettingsParameters, {}) },
        { label: "Skills", key: "skills", content: (0, jsx_runtime_1.jsx)(SettingsSkills_1.SettingsSkills, {}) },
        { label: "Advanced", key: "advanced", content: (0, jsx_runtime_1.jsx)(SettingsAdvanced_1.SettingsAdvanced, {}) },
        { label: "About", key: "about", content: (0, jsx_runtime_1.jsx)(SettingsAbout_1.SettingsAbout, {}) },
    ];
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(TabList_1.TabList, { tabs: tabs, activeTab: activeTab, onTabChange: (tab) => setCurrentView(`settings-${tab}`) }), (0, jsx_runtime_1.jsx)(BubbleWindowBottomBar_1.BubbleWindowBottomBar, { children: (0, jsx_runtime_1.jsx)("button", { onClick: onClose, children: "Back to Chat" }) })] }));
};
exports.Settings = Settings;
/**
 * Converts a BubbleView to a SettingsTab.
 *
 * @param view - The BubbleView to convert.
 * @returns The SettingsTab.
 */
function bubbleViewToSettingsTab(view) {
    if (!view || !view.includes("settings")) {
        return "appearance";
    }
    const settingsTab = view.replace(/settings-?/, "");
    const settingsTabs = [
        "appearance",
        "model",
        "parameters",
        "skills",
        "advanced",
        "about",
    ];
    if (settingsTabs.includes(settingsTab)) {
        return settingsTab;
    }
    return "appearance";
}
