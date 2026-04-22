"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Progress = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Progress = ({ progress }) => {
    return ((0, jsx_runtime_1.jsx)("div", { className: "progress-indicator segmented", children: (0, jsx_runtime_1.jsx)("span", { className: "progress-indicator-bar", style: { width: `${progress}%` } }) }));
};
exports.Progress = Progress;
