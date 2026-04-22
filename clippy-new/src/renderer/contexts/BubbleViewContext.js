"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBubbleView = exports.BubbleViewProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const clippyApi_1 = require("../clippyApi");
const BubbleViewContext = (0, react_1.createContext)(undefined);
const BubbleViewProvider = ({ children, }) => {
    const [currentView, setCurrentView] = (0, react_1.useState)("chat");
    (0, react_1.useEffect)(() => {
        clippyApi_1.clippyApi.offSetBubbleView();
        clippyApi_1.clippyApi.onSetBubbleView((view) => {
            setCurrentView(view);
        });
        return () => {
            clippyApi_1.clippyApi.offSetBubbleView();
        };
    }, []);
    return ((0, jsx_runtime_1.jsx)(BubbleViewContext.Provider, { value: { currentView, setCurrentView }, children: children }));
};
exports.BubbleViewProvider = BubbleViewProvider;
const useBubbleView = () => {
    const context = (0, react_1.useContext)(BubbleViewContext);
    if (context === undefined) {
        throw new Error("useBubbleView must be used within a BubbleViewProvider");
    }
    return context;
};
exports.useBubbleView = useBubbleView;
