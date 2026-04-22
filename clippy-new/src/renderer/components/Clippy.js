"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clippy = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const clippy_animations_1 = require("../clippy-animations");
const clippy_animation_helpers_1 = require("../clippy-animation-helpers");
const ChatContext_1 = require("../contexts/ChatContext");
const logging_1 = require("../logging");
const DebugContext_1 = require("../contexts/DebugContext");
const WAIT_TIME = 6000;
function Clippy() {
    const { animationKey, status, setStatus, setIsChatWindowOpen, isChatWindowOpen, } = (0, ChatContext_1.useChat)();
    const { enableDragDebug } = (0, DebugContext_1.useDebugState)();
    const [animation, setAnimation] = (0, react_1.useState)(clippy_animation_helpers_1.EMPTY_ANIMATION);
    const [animationTimeoutId, setAnimationTimeoutId] = (0, react_1.useState)(undefined);
    const playAnimation = (0, react_1.useCallback)((key) => {
        if (clippy_animations_1.ANIMATIONS[key]) {
            (0, logging_1.log)(`Playing animation`, { key });
            if (animationTimeoutId) {
                window.clearTimeout(animationTimeoutId);
            }
            setAnimation(clippy_animations_1.ANIMATIONS[key]);
            setAnimationTimeoutId(window.setTimeout(() => {
                setAnimation(clippy_animations_1.ANIMATIONS.Default);
            }, clippy_animations_1.ANIMATIONS[key].length + 200));
        }
        else {
            (0, logging_1.log)(`Animation not found`, { key });
        }
    }, [animationTimeoutId]);
    const toggleChat = (0, react_1.useCallback)(() => {
        setIsChatWindowOpen(!isChatWindowOpen);
    }, [isChatWindowOpen, setIsChatWindowOpen]);
    (0, react_1.useEffect)(() => {
        const playRandomIdleAnimation = () => {
            if (status !== "idle")
                return;
            const randomIdleAnimation = (0, clippy_animation_helpers_1.getRandomIdleAnimation)(animation);
            setAnimation(randomIdleAnimation);
            // Reset back to default after 6 seconds and schedule next animation
            setAnimationTimeoutId(window.setTimeout(() => {
                setAnimation(clippy_animations_1.ANIMATIONS.Default);
                setAnimationTimeoutId(window.setTimeout(playRandomIdleAnimation, WAIT_TIME));
            }, randomIdleAnimation.length));
        };
        if (status === "welcome" && animation === clippy_animation_helpers_1.EMPTY_ANIMATION) {
            setAnimation(clippy_animations_1.ANIMATIONS.Show);
            setTimeout(() => {
                setStatus("idle");
            }, clippy_animations_1.ANIMATIONS.Show.length + 200);
        }
        else if (status === "idle") {
            if (!animationTimeoutId) {
                playRandomIdleAnimation();
            }
        }
        // Clean up timeouts when component unmounts or status changes
        return () => {
            if (animationTimeoutId) {
                window.clearTimeout(animationTimeoutId);
            }
        };
    }, [status, animation, animationTimeoutId, setStatus]);
    (0, react_1.useEffect)(() => {
        (0, logging_1.log)(`New animation key`, { animationKey });
        playAnimation(animationKey);
    }, [animationKey, playAnimation]);
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "app-drag", style: {
                    position: "absolute",
                    height: "93px",
                    width: "124px",
                    backgroundColor: enableDragDebug ? "blue" : "transparent",
                    opacity: 0.5,
                    zIndex: 5,
                }, children: (0, jsx_runtime_1.jsx)("div", { className: "app-no-drag", style: {
                        position: "absolute",
                        height: "80px",
                        width: "45px",
                        backgroundColor: enableDragDebug ? "red" : "transparent",
                        zIndex: 10,
                        right: "40px",
                        top: "2px",
                        cursor: "help",
                    }, onClick: toggleChat }) }), (0, jsx_runtime_1.jsx)("img", { className: "app-no-select", src: animation.src, draggable: false, alt: "Clippy" })] }));
}
exports.Clippy = Clippy;
