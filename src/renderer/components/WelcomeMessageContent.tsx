import React from "react";
import { useBubbleView } from "../contexts/BubbleViewContext";
import { useSharedState } from "../contexts/SharedStateContext";
import { Progress } from "./Progress";
import { isModelDownloading, isModelReady } from "../../helpers/model-helpers";
import { prettyDownloadSpeed } from "../helpers/convert-download-speed";

export const WelcomeMessageContent: React.FC = () => {
  const { setCurrentView } = useBubbleView();
  const { models } = useSharedState();

  // Find if any model is currently downloading
  const downloadingModel = Object.values(models || {}).find(isModelDownloading);
  // Check if any model is ready
  const readyModel = Object.values(models || {}).find(isModelReady);

  return (
    <div>
      <strong>Welcome to Clippy!</strong>
      <p>
        This little app is a love letter and homage to the late, great Clippy,
        the assistant from Microsoft Office 1997. The character was designed by
        illustrator Kevan Atteberry, who created more than 15 potential
        characters for Microsoft's Office Assistants. It is <i>not</i>{" "}
        affiliated, approved, or supported by Microsoft. Consider it software
        art or satire.
      </p>
      <p>
        Clippy can run a Large Language Model (LLM) locally, so
        that you can chat with it offline, or use an API-based model like Google Gemini.
      </p>
      <p>
        To get started, please go to the <strong>Model Settings</strong> to choose
        how you want to use Clippy:
      </p>
      <ul>
        <li>
          <strong>Self-hosted:</strong> Download and run models like Gemma 3 or Llama 3 directly on your computer. No internet required after download!
        </li>
        <li>
          <strong>API-based:</strong> Use Google's Gemini models. This requires an internet connection and a Gemini API key.
        </li>
      </ul>
      <p>
        By the way, you can open or close this chat window by clicking right on
        Clippy's head.
      </p>

      {downloadingModel && (
        <div style={{ marginTop: "15px", marginBottom: "15px" }}>
          <p>
            Downloading {downloadingModel.name}... (
            {prettyDownloadSpeed(
              downloadingModel.downloadState?.currentBytesPerSecond || 0,
            )}
            /s)
          </p>
          <Progress
            progress={downloadingModel.downloadState?.percentComplete || 0}
          />
        </div>
      )}

      {!downloadingModel && readyModel && (
        <div style={{ marginTop: "15px", marginBottom: "15px" }}>
          <p style={{ color: "green", fontWeight: "bold" }}>
            ✓ {readyModel.name} is ready! You can now start chatting with
            Clippy.
          </p>
        </div>
      )}

      <button onClick={() => setCurrentView("settings-model")}>
        Open Model Settings
      </button>
    </div>
  );
};
