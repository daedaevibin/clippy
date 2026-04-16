import React from "react";
import { useSharedState } from "../contexts/SharedStateContext";
import { clippyApi } from "../clippyApi";
import { Checkbox } from "./Checkbox";

export const SettingsSkills: React.FC = () => {
  const { settings } = useSharedState();

  const handleTerminalToggle = async (enabled: boolean) => {
    if (enabled) {
      const confirmed = window.confirm(
        "Warning: Enabling terminal access allows the AI to execute commands on your system. This can be dangerous. Are you sure you want to enable this?",
      );
      if (!confirmed) return;
    }
    clippyApi.setState("settings.enableTerminalAccess", enabled);
  };

  const handleFileToggle = async (enabled: boolean) => {
    if (enabled) {
      const confirmed = window.confirm(
        "Warning: Enabling file access allows the AI to read and write files on your system. Are you sure you want to enable this?",
      );
      if (!confirmed) return;
    }
    clippyApi.setState("settings.enableFileAccess", enabled);
  };

  const handleRootToggle = async (enabled: boolean) => {
    if (enabled) {
      const confirmed = window.confirm(
        "Warning: Allowing root access allows the AI to access ANY file on your system, including system files. This is highly risky. Are you sure?",
      );
      if (!confirmed) return;
    }
    clippyApi.setState("settings.allowRootAccess", enabled);
  };

  return (
    <div style={{ padding: "10px" }}>
      <p>
        Enable additional capabilities (Skills) for the Gemini models. These
        allow Clippy to interact with your system more directly.
      </p>

      <fieldset>
        <legend>System Skills</legend>
        <div className="field-row">
          <Checkbox
            id="enable-terminal"
            label="Enable Terminal Access (Execute Commands)"
            checked={!!settings.enableTerminalAccess}
            onChange={handleTerminalToggle}
          />
        </div>
        <div className="field-row">
          <Checkbox
            id="enable-file"
            label="Enable File System Access (Read/Write Files)"
            checked={!!settings.enableFileAccess}
            onChange={handleFileToggle}
          />
        </div>
      </fieldset>

      <fieldset style={{ marginTop: "15px" }}>
        <legend>Security & Permissions</legend>
        <div className="field-row">
          <Checkbox
            id="allow-root"
            label="Allow Root Directory (/) Access"
            checked={!!settings.allowRootAccess}
            disabled={!settings.enableFileAccess}
            onChange={handleRootToggle}
          />
        </div>
        <p style={{ fontSize: "11px", color: "#666", marginTop: "5px" }}>
          By default, file access is restricted to your user directory if root access is disabled.
        </p>
      </fieldset>
    </div>
  );
};
