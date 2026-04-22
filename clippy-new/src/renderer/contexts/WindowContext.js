"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWindowContext = exports.useWindow = exports.WindowProvider = exports.WindowContext = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
exports.WindowContext = (0, react_1.createContext)({
    currentWindow: window,
});
const WindowProvider = ({ children }) => {
    const [isChatWindowOpen, setIsChatWindowOpen] = (0, react_1.useState)(false);
    return ((0, jsx_runtime_1.jsx)(exports.WindowContext.Provider, { value: { isChatWindowOpen, setIsChatWindowOpen, currentWindow: window }, children: children }));
};
exports.WindowProvider = WindowProvider;
const useWindow = () => {
    const context = (0, react_1.useContext)(exports.WindowContext);
    if (context === undefined) {
        throw new Error("useWindow must be used within a WindowProvider");
    }
    return context;
};
exports.useWindow = useWindow;
exports.useWindowContext = exports.useWindow;
