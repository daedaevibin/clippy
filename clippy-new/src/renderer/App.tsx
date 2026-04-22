import React from "react";
import "./components/css/App.css";
import "98.css/dist/98.css";
import "./components/css/98.extended.css";
import "./components/css/Theme.css";
import { Clippy } from "./components/Clippy";
import { ChatProvider } from "./contexts/ChatContext";
import { Bubble } from "./components/BubbleWindow";
import { SharedStateProvider } from "./contexts/SharedStateContext";
import { BubbleViewProvider } from "./contexts/BubbleViewContext";
import { DebugProvider } from "./contexts/DebugContext";
import { WindowPortal } from "./components/WindowPortal";

export function App() {
  return (
    <DebugProvider>
      <SharedStateProvider>
        <ChatProvider>
          <BubbleViewProvider>
            <div
              className="clippy"
              style={{
                position: "fixed",
                bottom: 0,
                right: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                width: "100%",
                height: "100%",
              }}
            >
              <Clippy />
              <WindowPortal width={450} height={650}>
                <Bubble />
              </WindowPortal>
            </div>
          </BubbleViewProvider>
        </ChatProvider>
      </SharedStateProvider>
    </DebugProvider>
  );
}
