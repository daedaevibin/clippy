import { useState } from "react";

import { Message } from "./Message";
import { ChatInput } from "./ChatInput";
import { ANIMATION_KEYS_BRACKETS } from "../clippy-animation-helpers";
import { useChat } from "../contexts/ChatContext";
import { clippyApi, electronAi } from "../clippyApi";
import { useSharedState } from "../contexts/SharedStateContext";

export type ChatProps = {
  style?: React.CSSProperties;
};

export function Chat({ style }: ChatProps) {
  const { setAnimationKey, setStatus, status, messages, addMessage } =
    useChat();
  const { settings } = useSharedState();
  const [streamingMessageContent, setStreamingMessageContent] =
    useState<string>("");
  const [streamingThoughtContent, setStreamingThoughtContent] =
    useState<string>("");
  const [streamingToolCalls, setStreamingToolCalls] = useState<any[]>([]);
  const [streamingToolResults, setStreamingToolResults] = useState<any[]>([]);
  const [lastRequestUUID, setLastRequestUUID] = useState<string>(
    crypto.randomUUID(),
  );

  const handleAbortMessage = () => {
    if (settings.selectedModel?.startsWith("Gemini")) {
      // Abort for Gemini not implemented in this simple version
      return;
    }
    electronAi.abortRequest(lastRequestUUID);
  };

  const handleSendMessage = async (message: string) => {
    if (status !== "idle") {
      return;
    }

    const userMessage: Message = {
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
          const { text, animationKey } = filterMessageContent(
            fullContent + chunk,
          );

          filteredContent = text;
          fullContent = fullContent + chunk;

          if (animationKey) {
            setAnimationKey(animationKey);
            hasSetAnimationKey = true;
          }
        } else {
          filteredContent += chunk;
        }

        setStreamingMessageContent(filteredContent);
      }

      // Once streaming is complete, add the full message to the messages array
      // and clear the streaming message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: filteredContent,
        sender: "clippy",
        createdAt: Date.now(),
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error(error);
    } finally {
      setStreamingMessageContent("");
      setStatus("idle");
    }
  };

  const handleGeminiSendMessage = (message: string) => {
    let fullContent = "";
    let filteredContent = "";
    let fullThought = "";
    const toolCalls: any[] = [];
    const toolResults: any[] = [];

    const allMessages = [
      ...messages.map((m) => ({
        role: m.sender === "clippy" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const gemini = clippyApi.geminiPromptStreaming({
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
      for (const key of ANIMATION_KEYS_BRACKETS) {
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
      if (lastOpenBracket !== -1 && !displayText.includes("]", lastOpenBracket)) {
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

      const assistantMessage: Message = {
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
      const assistantMessage: Message = {
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

  return (
    <div style={style} className="chat-container">
      <div
        className="sunken-panel"
        style={{ flex: 1, overflowY: "auto", marginBottom: "8px" }}
      >
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {status === "responding" && (
          <Message
            message={{
              id: "streaming",
              content: streamingMessageContent,
              thought: streamingThoughtContent,
              toolCalls: streamingToolCalls,
              toolResults: streamingToolResults,
              sender: "clippy",
              createdAt: Date.now(),
            }}
          />
        )}
      </div>
      <ChatInput onSend={handleSendMessage} onAbort={handleAbortMessage} />
    </div>
  );
}

/**
 * Filter the message content to get the text and animation key
 *
 * @param content - The content of the message
 * @returns The text and animation key
 */
function filterMessageContent(content: string): {
  text: string;
  animationKey: string;
} {
  let text = content;
  let animationKey = "";

  if (content === "[") {
    text = "";
  } else if (/^\[[A-Za-z]*$/m.test(content)) {
    text = content.replace(/^\[[A-Za-z]*$/m, "").trim();
  } else {
    // Check for animation keys in brackets
    for (const key of ANIMATION_KEYS_BRACKETS) {
      if (content.startsWith(key)) {
        animationKey = key.slice(1, -1);
        text = content.slice(key.length).trim();
        break;
      }
    }
  }

  return { text, animationKey };
}
