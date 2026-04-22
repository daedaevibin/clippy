"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSharedState = exports.SharedStateProvider = exports.SharedStateContext = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const sharedState_1 = require("../../sharedState");
const clippyApi_1 = require("../clippyApi");
const model_helpers_1 = require("../../helpers/model-helpers");
const EMPTY_SHARED_STATE = {
    models: {},
    settings: {
        ...sharedState_1.DEFAULT_SETTINGS,
        selectedModel: undefined,
        systemPrompt: undefined,
    },
};
exports.SharedStateContext = (0, react_1.createContext)(EMPTY_SHARED_STATE);
const SharedStateProvider = ({ children, }) => {
    const [sharedState, setSharedState] = (0, react_1.useState)(EMPTY_SHARED_STATE);
    const intervalRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const fetchSharedState = async () => {
            const state = await clippyApi_1.clippyApi.getFullState();
            setSharedState(state);
        };
        fetchSharedState();
        clippyApi_1.clippyApi.offStateChanged();
        clippyApi_1.clippyApi.onStateChanged((state) => {
            setSharedState(state);
        });
        return () => {
            clippyApi_1.clippyApi.offStateChanged();
        };
    }, []);
    (0, react_1.useEffect)(() => {
        // Check if any model is downloading
        const isAnyModelDownloading = Object.values(sharedState.models || {}).some(model_helpers_1.isModelDownloading);
        // Start interval if any model is downloading
        if (isAnyModelDownloading && !intervalRef.current) {
            intervalRef.current = setInterval(() => {
                clippyApi_1.clippyApi.updateModelState();
            }, 250);
        }
        // Stop interval if no model is downloading
        else if (!isAnyModelDownloading && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [sharedState.models]);
    return ((0, jsx_runtime_1.jsx)(exports.SharedStateContext.Provider, { value: sharedState, children: children }));
};
exports.SharedStateProvider = SharedStateProvider;
const useSharedState = () => {
    const sharedState = (0, react_1.useContext)(exports.SharedStateContext);
    if (!sharedState) {
        throw new Error("useSharedState must be used within a SharedStateProvider");
    }
    return sharedState;
};
exports.useSharedState = useSharedState;
