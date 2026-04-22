"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDebugState = exports.DebugProvider = exports.DebugContext = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const clippyApi_1 = require("../clippyApi");
const debugState_1 = require("../../debugState");
exports.DebugContext = (0, react_1.createContext)(debugState_1.EMPTY_DEBUG_STATE);
const DebugProvider = ({ children }) => {
    const [debugState, setDebugState] = (0, react_1.useState)(debugState_1.EMPTY_DEBUG_STATE);
    (0, react_1.useEffect)(() => {
        const fetchDebugState = async () => {
            const state = await clippyApi_1.clippyApi.getFullDebugState();
            setDebugState(state);
        };
        fetchDebugState();
        clippyApi_1.clippyApi.offDebugStateChanged();
        clippyApi_1.clippyApi.onDebugStateChanged((state) => {
            setDebugState(state);
        });
        return () => {
            clippyApi_1.clippyApi.offDebugStateChanged();
        };
    }, []);
    return ((0, jsx_runtime_1.jsx)(exports.DebugContext.Provider, { value: debugState, children: children }));
};
exports.DebugProvider = DebugProvider;
const useDebugState = () => {
    const context = (0, react_1.useContext)(exports.DebugContext);
    if (!context) {
        throw new Error("useDebugState must be used within a DebugProvider");
    }
    return context;
};
exports.useDebugState = useDebugState;
