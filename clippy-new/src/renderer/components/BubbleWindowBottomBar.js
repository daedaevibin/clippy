"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BubbleWindowBottomBar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const BubbleWindowBottomBar = ({ children, }) => {
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            display: "flex",
            justifyContent: "flex-end",
            marginLeft: "8px",
            marginRight: "8px",
        }, children: children }));
};
exports.BubbleWindowBottomBar = BubbleWindowBottomBar;
