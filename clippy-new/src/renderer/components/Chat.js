"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Message_1 = require("./Message");
const ChatInput_1 = require("./ChatInput");
const clippy_animation_helpers_1 = require("../clippy-animation-helpers");
const ChatContext_1 = require("../contexts/ChatContext");
const clippyApi_1 = require("../clippyApi");
const SharedStateContext_1 = require("../contexts/SharedStateContext");
function Chat({ style }) {
    const { setAnimationKey, setStatus, status, messages, addMessage } = (0, ChatContext_1.useChat)();
    const { settings } = (0, SharedStateContext_1.useSharedState)();
    const [streamingMessageContent, setStreamingMessageContent] = (0, react_1.useState)("");
    const [streamingThoughtContent, setStreamingThoughtContent] = (0, react_1.useState)("");
    const [streamingToolCalls, setStreamingToolCalls] = (0, react_1.useState)([]);
    const [streamingToolResults, setStreamingToolResults] = (0, react_1.useState)([]);
    const [lastRequestUUID, setLastRequestUUID] = (0, react_1.useState)(crypto.randomUUID());
    const handleAbortMessage = () => {
        if (settings.selectedModel?.startsWith("Gemini")) {
            // Abort for Gemini not implemented in this simple version
            return;
        }
        clippyApi_1.electronAi.abortRequest(lastRequestUUID);
    };
    const handleSendMessage = async (message) => {
        if (status !== "idle") {
            return;
        }
        const userMessage = {
            id: crypto.randomUUID(),
            content: message,
            sender: "user",
            createdAt: Date.now(),
        };
        await addMessage(userMessage);
        setStreamingMessageContent("");
        setStatus("thinking");
        if (settings.selectedModel?.startsWith("Gemini")) {
            handleGeminiSendMessage(message);
            return;
        }
        try {
            const requestUUID = crypto.randomUUID();
            setLastRequestUUID(requestUUID);
            const response = await window.electronAi.promptStreaming(message, {
                requestUUID,
            });
            let fullContent = "";
            let filteredContent = "";
            let hasSetAnimationKey = false;
            for await (const chunk of response) {
                if (fullContent === "") {
                    setStatus("responding");
                }
                if (!hasSetAnimationKey) {
                    const { text, animationKey } = filterMessageContent(fullContent + chunk);
                    filteredContent = text;
                    fullContent = fullContent + chunk;
                    if (animationKey) {
                        setAnimationKey(animationKey);
                        hasSetAnimationKey = true;
                    }
                }
                else {
                    filteredContent += chunk;
                }
                setStreamingMessageContent(filteredContent);
            }
            // Once streaming is complete, add the full message to the messages array
            // and clear the streaming message
            const assistantMessage = {
                id: crypto.randomUUID(),
                content: filteredContent,
                sender: "clippy",
                createdAt: Date.now(),
            };
            addMessage(assistantMessage);
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setStreamingMessageContent("");
            setStatus("idle");
        }
    };
    const handleGeminiSendMessage = (message) => {
        let fullContent = "";
        let filteredContent = "";
        let fullThought = "";
        const toolCalls = [];
        const toolResults = [];
        const allMessages = [
            ...messages.map((m) => ({
                role: m.sender === "clippy" ? "assistant" : "user",
                content: m.content,
            })),
            { role: "user", content: message },
        ];
        const gemini = clippyApi_1.clippyApi.geminiPromptStreaming({
            model: settings.selectedModel || "Gemini 2.5 Flash",
            messages: allMessages,
            systemPrompt: settings.systemPrompt || "",
            temperature: settings.temperature || 0.7,
        });
        const unsubThought = gemini.onThought((thought) => {
            if (fullContent === "" && fullThought === "") {
                setStatus("responding");
            }
            fullThought += thought;
            setStreamingThoughtContent(fullThought);
        });
        const unsubChunk = gemini.onChunk((chunk) => {
            if (fullContent === "" && fullThought === "") {
                setStatus("responding");
            }
            fullContent += chunk;
            // Scan for animations [Key]
            let scanText = fullContent;
            for (const key of clippy_animation_helpers_1.ANIMATION_KEYS_BRACKETS) {
                if (scanText.includes(key)) {
                    const keyName = key.slice(1, -1);
                    setAnimationKey(keyName);
                    // Remove all occurrences of the animation tag from the display text
                    scanText = scanText.split(key).join("");
                }
            }
            // Handle partial tags at the end of the content (e.g. "[Wav")
            // by not showing them yet
            let displayText = scanText;
            const lastOpenBracket = displayText.lastIndexOf("[");
            if (lastOpenBracket !== -1 &&
                !displayText.includes("]", lastOpenBracket)) {
                displayText = displayText.substring(0, lastOpenBracket);
            }
            setStreamingMessageContent(displayText.trimStart());
            filteredContent = displayText.trimStart();
        });
        const unsubToolCall = gemini.onToolCall((toolCall) => {
            setStatus("responding");
            toolCalls.push(toolCall);
            setStreamingToolCalls([...toolCalls]);
        });
        const unsubToolResult = gemini.onToolResult((toolResult) => {
            toolResults.push(toolResult);
            setStreamingToolResults([...toolResults]);
        });
        const cleanup = () => {
            unsubThought();
            unsubChunk();
            unsubToolCall();
            unsubToolResult();
        };
        gemini.onDone(() => {
            cleanup();
            let finalContent = filteredContent;
            if (!finalContent && !fullThought && toolCalls.length === 0) {
                finalContent = "No response received from Gemini.";
            }
            const assistantMessage = {
                id: crypto.randomUUID(),
                content: finalContent,
                thought: fullThought,
                toolCalls: [...toolCalls],
                toolResults: [...toolResults],
                sender: "clippy",
                createdAt: Date.now(),
            };
            addMessage(assistantMessage);
            setStreamingMessageContent("");
            setStreamingThoughtContent("");
            setStreamingToolCalls([]);
            setStreamingToolResults([]);
            setStatus("idle");
        });
        gemini.onError((error) => {
            cleanup();
            const assistantMessage = {
                id: crypto.randomUUID(),
                content: `Error: ${error}`,
                sender: "clippy",
                createdAt: Date.now(),
            };
            addMessage(assistantMessage);
            setStreamingMessageContent("");
            setStreamingThoughtContent("");
            setStreamingToolCalls([]);
            setStreamingToolResults([]);
            setStatus("idle");
        });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: style, className: "chat-container", children: [(0, jsx_runtime_1.jsxs)("div", { className: "sunken-panel", style: { flex: 1, overflowY: "auto", marginBottom: "8px" }, children: [messages.map((message) => ((0, jsx_runtime_1.jsx)(Message_1.Message, { message: message }, message.id))), status === "responding" && ((0, jsx_runtime_1.jsx)(Message_1.Message, { message: {
                            id: "streaming",
                            content: streamingMessageContent,
                            thought: streamingThoughtContent,
                            toolCalls: streamingToolCalls,
                            toolResults: streamingToolResults,
                            sender: "clippy",
                            createdAt: Date.now(),
                        } }))] }), (0, jsx_runtime_1.jsx)(ChatInput_1.ChatInput, { onSend: handleSendMessage, onAbort: handleAbortMessage })] }));
}
exports.Chat = Chat;
/**
 * Filter the message content to get the text and animation key
 *
 * @param content - The content of the message
 * @returns The text and animation key
 */
function filterMessageContent(content) {
    let text = content;
    let animationKey = "";
    if (content === "[") {
        text = "";
    }
    else if (/^\[[A-Za-z]*$/m.test(content)) {
        text = content.replace(/^\[[A-Za-z]*$/m, "").trim();
    }
    else {
        // Check for animation keys in brackets
        for (const key of clippy_animation_helpers_1.ANIMATION_KEYS_BRACKETS) {
            if (content.startsWith(key)) {
                animationKey = key.slice(1, -1);
                text = content.slice(key.length).trim();
                break;
            }
        }
    }
    return { text, animationKey };
}
