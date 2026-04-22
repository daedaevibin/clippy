"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChat = exports.ChatProvider = exports.ChatContext = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const clippyApi_1 = require("../clippyApi");
const SharedStateContext_1 = require("./SharedStateContext");
const model_helpers_1 = require("../../helpers/model-helpers");
const WelcomeMessageContent_1 = require("../components/WelcomeMessageContent");
const DebugContext_1 = require("./DebugContext");
const clippy_animation_helpers_1 = require("../clippy-animation-helpers");
const ErrorLoadModelMessageContent_1 = require("../components/ErrorLoadModelMessageContent");
exports.ChatContext = (0, react_1.createContext)(undefined);
function ChatProvider({ children }) {
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [currentChatRecord, setCurrentChatRecord] = (0, react_1.useState)({
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        preview: "",
    });
    const [chatRecords, setChatRecords] = (0, react_1.useState)({});
    const [animationKey, setAnimationKey] = (0, react_1.useState)("");
    const [status, setStatus] = (0, react_1.useState)("welcome");
    const [isModelLoaded, setIsModelLoaded] = (0, react_1.useState)(false);
    const { settings, models } = (0, react_1.useContext)(SharedStateContext_1.SharedStateContext);
    const debug = (0, DebugContext_1.useDebugState)();
    const [isChatWindowOpen, setIsChatWindowOpen] = (0, react_1.useState)(false);
    const [hasPerformedStartupCheck, setHasPerformedStartupCheck] = (0, react_1.useState)(false);
    const getSystemPrompt = (0, react_1.useCallback)(() => {
        return settings.systemPrompt.replace("[LIST OF ANIMATIONS]", clippy_animation_helpers_1.ANIMATION_KEYS_BRACKETS.join(", "));
    }, [settings.systemPrompt]);
    const addMessage = (0, react_1.useCallback)(async (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    }, [currentChatRecord, messages]);
    const selectChat = (0, react_1.useCallback)(async (chatId) => {
        try {
            const chatWithMessages = await clippyApi_1.clippyApi.getChatWithMessages(chatId);
            if (chatWithMessages) {
                setMessages(chatWithMessages.messages);
                setCurrentChatRecord(chatWithMessages.chat);
            }
            await loadModel(messagesToInitialPrompts(chatWithMessages?.messages || []));
        }
        catch (error) {
            console.error(error);
        }
    }, [currentChatRecord, messages]);
    const startNewChat = (0, react_1.useCallback)(async () => {
        // No need if there are no messages, we'll just keep the current chat
        // and update the timestamps
        if (messages.length === 0) {
            setCurrentChatRecord({
                ...currentChatRecord,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
            return;
        }
        const newChatRecord = {
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            preview: "",
        };
        setCurrentChatRecord(newChatRecord);
        setChatRecords((prevChatRecords) => ({
            ...prevChatRecords,
            [newChatRecord.id]: newChatRecord,
        }));
        setMessages([]);
    }, [currentChatRecord, messages]);
    const loadModel = (0, react_1.useCallback)(async (initialPrompts = []) => {
        setIsModelLoaded(false);
        const options = {
            modelAlias: settings.selectedModel,
            systemPrompt: getSystemPrompt(),
            topK: settings.topK,
            temperature: settings.temperature,
            initialPrompts,
        };
        console.log("Loading model with options:", options);
        if (settings.selectedModel?.startsWith("Gemini")) {
            setIsModelLoaded(true);
            return;
        }
        try {
            await clippyApi_1.electronAi.create(options);
            setIsModelLoaded(true);
        }
        catch (error) {
            console.error(error);
            addMessage({
                id: crypto.randomUUID(),
                children: (0, jsx_runtime_1.jsx)(ErrorLoadModelMessageContent_1.ErrorLoadModelMessageContent, { error: error }),
                sender: "clippy",
                createdAt: Date.now(),
            });
        }
    }, [
        settings.selectedModel,
        settings.systemPrompt,
        settings.topK,
        settings.temperature,
        messages,
    ]);
    const deleteChat = (0, react_1.useCallback)(async (chatId) => {
        await clippyApi_1.clippyApi.deleteChat(chatId);
        setChatRecords((prevChatRecords) => {
            const newChatRecords = { ...prevChatRecords };
            delete newChatRecords[chatId];
            return newChatRecords;
        });
        if (currentChatRecord.id === chatId) {
            await startNewChat();
        }
    }, [currentChatRecord.id]);
    const deleteAllChats = (0, react_1.useCallback)(async () => {
        await clippyApi_1.clippyApi.deleteAllChats();
        setChatRecords({});
        setMessages([]);
        startNewChat();
    }, []);
    // Update the chat record in the database whenever messages change
    (0, react_1.useEffect)(() => {
        const updatedChatRecord = {
            ...currentChatRecord,
            updatedAt: Date.now(),
            preview: currentChatRecord.preview || getPreviewFromMessages(messages),
        };
        const chatWithMessages = {
            chat: updatedChatRecord,
            messages: messages.map(messageRecordFromMessage),
        };
        setCurrentChatRecord(updatedChatRecord);
        clippyApi_1.clippyApi.writeChatWithMessages(chatWithMessages).catch((error) => {
            console.error(error);
        });
    }, [messages]);
    // Load the model when the selected model changes
    // or when the system prompt, topK, or temperature change
    (0, react_1.useEffect)(() => {
        if (debug?.simulateDownload) {
            setIsModelLoaded(true);
            return;
        }
        if (settings.selectedModel) {
            loadModel();
        }
        else if (!settings.selectedModel && isModelLoaded) {
            clippyApi_1.electronAi
                .destroy()
                .then(() => {
                setIsModelLoaded(false);
            })
                .catch((error) => {
                console.error(error);
            });
        }
    }, [
        settings.selectedModel,
        settings.systemPrompt,
        settings.topK,
        settings.temperature,
    ]);
    // At app startup, initially load the chat records from the main process
    (0, react_1.useEffect)(() => {
        clippyApi_1.clippyApi.getChatRecords().then((chatRecords) => {
            setChatRecords(chatRecords);
        });
    }, []);
    // At app startup, check if any models are ready. If none are, kick off a download
    // for our smallest model and tell the user about it.
    (0, react_1.useEffect)(() => {
        if (messages.length > 0 ||
            Object.keys(models).length === 0 ||
            (0, model_helpers_1.areAnyModelsReadyOrDownloading)(models) ||
            settings.selectedModel?.startsWith("Gemini") ||
            hasPerformedStartupCheck) {
            return;
        }
        setHasPerformedStartupCheck(true);
        addMessage({
            id: crypto.randomUUID(),
            children: (0, jsx_runtime_1.jsx)(WelcomeMessageContent_1.WelcomeMessageContent, {}),
            content: "Welcome to Clippy!",
            sender: "clippy",
            createdAt: Date.now(),
        });
    }, [models]);
    // Subscribe to the main process's newChat event
    (0, react_1.useEffect)(() => {
        clippyApi_1.clippyApi.offNewChat();
        clippyApi_1.clippyApi.onNewChat(async () => {
            await startNewChat();
        });
        return () => {
            clippyApi_1.clippyApi.offNewChat();
        };
    }, [startNewChat]);
    const value = {
        chatRecords,
        currentChatRecord,
        selectChat,
        deleteChat,
        deleteAllChats,
        startNewChat,
        messages,
        addMessage,
        setMessages,
        animationKey,
        setAnimationKey,
        status,
        setStatus,
        isModelLoaded,
        isChatWindowOpen,
        setIsChatWindowOpen,
    };
    return (0, jsx_runtime_1.jsx)(exports.ChatContext.Provider, { value: value, children: children });
}
exports.ChatProvider = ChatProvider;
function useChat() {
    const context = (0, react_1.useContext)(exports.ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
}
exports.useChat = useChat;
function messageRecordFromMessage(message) {
    return {
        id: message.id,
        content: message.content,
        thought: message.thought,
        sender: message.sender,
        createdAt: message.createdAt,
    };
}
function getPreviewFromMessages(messages) {
    if (messages.length === 0) {
        return "";
    }
    if (messages[0].sender === "clippy") {
        return "Welcome to Clippy!";
    }
    // Remove newlines and limit to 100 characters
    return messages[0]?.content?.replace(/\n/g, " ").substring(0, 100) || "";
}
function messagesToInitialPrompts(messages) {
    return messages.map((message) => ({
        role: message.sender === "clippy"
            ? "assistant"
            : "user",
        type: "text",
        content: message.content || "",
    }));
}
