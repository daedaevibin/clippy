"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabList = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
function TabList({ tabs, activeTab, onTabChange }) {
    const [internalActiveTab, setInternalActiveTab] = react_1.default.useState(0);
    // Find the active tab index based on value
    const activeTabIndex = activeTab
        ? tabs.findIndex((tab) => tab.key === activeTab)
        : internalActiveTab;
    const handleTabClick = (index) => {
        if (onTabChange) {
            onTabChange(tabs[index].key);
        }
        else {
            setInternalActiveTab(index);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "window-body", children: [(0, jsx_runtime_1.jsx)("menu", { role: "tablist", children: tabs.map((tab, index) => ((0, jsx_runtime_1.jsx)("li", { role: "tab", "aria-selected": activeTabIndex === index, onClick: () => handleTabClick(index), style: {
                        cursor: "pointer",
                    }, children: (0, jsx_runtime_1.jsx)("a", { children: tab.label }) }, index))) }), (0, jsx_runtime_1.jsx)("div", { role: "tabpanel", className: "sunken-panel", style: { height: "calc(100% - 40px)", overflowY: "auto" }, children: tabs[activeTabIndex]?.content })] }));
}
exports.TabList = TabList;
