import Markdown from "react-markdown";
import questionIcon from "../images/icons/question.png";
import defaultClippy from "../images/animations/Default.png";
import { MessageRecord, ToolCall, ToolResult } from "../../types/interfaces";

export interface Message extends MessageRecord {
  id: string;
  content?: string;
  thought?: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  children?: React.ReactNode;
  createdAt: number;
  sender: "user" | "clippy";
}

export function Message({ message }: { message: Message }) {
  return (
    <div
      className="message"
      style={{ display: "flex", alignItems: "flex-start", marginBottom: "8px" }}
    >
      <img
        src={message.sender === "user" ? questionIcon : defaultClippy}
        alt={`${message.sender === "user" ? "You" : "Clippy"}`}
        style={{ width: "24px", height: "24px", marginRight: "8px" }}
      />
      <div className="message-content" style={{ flex: 1 }}>
        {message.thought && (
          <div
            className="thought-block"
            style={{
              fontStyle: "italic",
              color: "#666",
              fontSize: "0.9em",
              marginBottom: "4px",
              paddingLeft: "8px",
              borderLeft: "2px solid #ddd",
              whiteSpace: "pre-wrap",
            }}
          >
            {message.thought}
          </div>
        )}

        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="tool-calls" style={{ marginBottom: "8px" }}>
            {message.toolCalls.map((call, index) => {
              const result = message.toolResults?.find(
                (r) => r.name === call.name,
              );
              return (
                <div
                  key={index}
                  className="tool-call-block"
                  style={{
                    fontSize: "0.85em",
                    backgroundColor: "#f0f0f0",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    marginBottom: "4px",
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>
                    {result ? "✓" : "⚡"} Executing {call.name}...
                  </div>
                  <div
                    style={{
                      color: "#444",
                      fontFamily: "monospace",
                      fontSize: "0.8em",
                    }}
                  >
                    {JSON.stringify(call.args)}
                  </div>
                  {result && (
                    <details style={{ marginTop: "4px" }}>
                      <summary style={{ cursor: "pointer", fontSize: "0.9em" }}>
                        Result
                      </summary>
                      <pre
                        style={{
                          maxHeight: "200px",
                          overflow: "auto",
                          backgroundColor: "#fff",
                          padding: "4px",
                          border: "1px solid #eee",
                          marginTop: "4px",
                          fontSize: "0.8em",
                        }}
                      >
                        {String(result.result)}
                      </pre>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {message.children ? (
          message.children
        ) : (
          <Markdown
            components={{
              a: ({ node, ...props }) => (
                <a target="_blank" rel="noopener noreferrer" {...props} />
              ),
            }}
          >
            {message.content}
          </Markdown>
        )}
      </div>
    </div>
  );
}
