import { clipboard, Data, ipcMain } from "electron";
import {
  toggleChatWindow,
  maximizeChatWindow,
  minimizeChatWindow,
} from "./windows";
import { IpcMessages } from "../ipc-messages";
import { getModelManager } from "./models";
import { getStateManager } from "./state";
import { getChatManager } from "./chats";
import { ChatWithMessages } from "../types/interfaces";
import { getMainAppMenu } from "./menu";
import { checkForUpdates } from "./update";
import { getVersions } from "./helpers/getVersions";
import { getClippyDebugInfo } from "./debug-clippy";
import { getDebugManager } from "./debug";
import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { app } from "electron";

export function setupIpcListeners() {
  // Window
  ipcMain.handle(IpcMessages.TOGGLE_CHAT_WINDOW, () => toggleChatWindow());
  ipcMain.handle(IpcMessages.MINIMIZE_CHAT_WINDOW, () => minimizeChatWindow());
  ipcMain.handle(IpcMessages.MAXIMIZE_CHAT_WINDOW, () => maximizeChatWindow());
  ipcMain.handle(IpcMessages.POPUP_APP_MENU, () => getMainAppMenu().popup());

  // App
  ipcMain.handle(IpcMessages.APP_CHECK_FOR_UPDATES, () => checkForUpdates());
  ipcMain.handle(IpcMessages.APP_GET_VERSIONS, () => getVersions());

  // Model
  ipcMain.handle(IpcMessages.DOWNLOAD_MODEL_BY_NAME, (_, name: string) =>
    getModelManager().downloadModelByName(name),
  );
  ipcMain.handle(IpcMessages.REMOVE_MODEL_BY_NAME, (_, name: string) =>
    getModelManager().removeModelByName(name),
  );
  ipcMain.handle(IpcMessages.DELETE_MODEL_BY_NAME, (_, name: string) =>
    getModelManager().deleteModelByName(name),
  );
  ipcMain.handle(IpcMessages.DELETE_ALL_MODELS, () =>
    getModelManager().deleteAllModels(),
  );
  ipcMain.handle(IpcMessages.ADD_MODEL_FROM_FILE, () =>
    getModelManager().addModelFromFile(),
  );

  // State
  ipcMain.handle(IpcMessages.STATE_UPDATE_MODEL_STATE, () =>
    getStateManager().updateModelState(),
  );
  ipcMain.handle(
    IpcMessages.STATE_GET_FULL,
    () => getStateManager().store.store,
  );
  ipcMain.handle(IpcMessages.STATE_SET, (_, key: string, value: any) =>
    getStateManager().store.set(key, value),
  );
  ipcMain.handle(IpcMessages.STATE_GET, (_, key: string) =>
    getStateManager().store.get(key),
  );
  ipcMain.handle(IpcMessages.STATE_OPEN_IN_EDITOR, () =>
    getStateManager().store.openInEditor(),
  );

  // Debug
  ipcMain.handle(
    IpcMessages.DEBUG_STATE_GET_FULL,
    () => getDebugManager().store.store,
  );
  ipcMain.handle(IpcMessages.DEBUG_STATE_SET, (_, key: string, value: any) =>
    getDebugManager().store.set(key, value),
  );
  ipcMain.handle(IpcMessages.DEBUG_STATE_GET, (_, key: string) =>
    getDebugManager().store.get(key),
  );
  ipcMain.handle(IpcMessages.DEBUG_STATE_OPEN_IN_EDITOR, () =>
    getDebugManager().store.openInEditor(),
  );
  ipcMain.handle(IpcMessages.DEBUG_GET_DEBUG_INFO, () => getClippyDebugInfo());

  // Chat
  ipcMain.handle(IpcMessages.CHAT_GET_CHAT_RECORDS, () =>
    getChatManager().getChats(),
  );
  ipcMain.handle(IpcMessages.CHAT_GET_CHAT_WITH_MESSAGES, (_, chatId: string) =>
    getChatManager().getChatWithMessages(chatId),
  );
  ipcMain.handle(
    IpcMessages.CHAT_WRITE_CHAT_WITH_MESSAGES,
    (_, chatWithMessages: ChatWithMessages) =>
      getChatManager().writeChatWithMessages(chatWithMessages),
  );
  ipcMain.handle(IpcMessages.CHAT_DELETE_CHAT, (_, chatId: string) =>
    getChatManager().deleteChat(chatId),
  );
  ipcMain.handle(IpcMessages.CHAT_DELETE_ALL_CHATS, () =>
    getChatManager().deleteAllChats(),
  );

  // Clipboard
  ipcMain.handle(IpcMessages.CLIPBOARD_WRITE, (_, data: Data) =>
    clipboard.write(data, "clipboard"),
  );

  // Gemini
  ipcMain.on(
    IpcMessages.GEMINI_PROMPT_STREAMING,
    async (event, { model, messages, systemPrompt, temperature }) => {
      try {
        const settings = getStateManager().store.get("settings");
        const apiKey = settings.geminiApiKey;
        if (!apiKey) {
          event.reply(
            `${IpcMessages.GEMINI_PROMPT_STREAMING}_ERROR`,
            "No Gemini API key found in settings.",
          );
          return;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        let modelId = "gemini-1.5-flash";
        if (model.includes("2.0")) modelId = "gemini-2.0-flash";
        if (model.includes("2.5")) modelId = "gemini-2.5-flash";
        if (model.includes("3.0")) modelId = "gemini-3-flash-preview";
        if (model.includes("3.1")) modelId = "gemini-3.1-flash-lite-preview";

        const tools: any[] = [];
        let skillDescription = "";

        if (settings.enableTerminalAccess || settings.enableFileAccess) {
          const functionDeclarations = [];

          if (settings.enableTerminalAccess) {
            skillDescription += " You can execute terminal commands.";
            functionDeclarations.push({
              name: "execute_command",
              description: "Execute a terminal command on the system.",
              parameters: {
                type: "OBJECT",
                properties: {
                  command: {
                    type: "STRING",
                    description: "The command to execute.",
                  },
                },
                required: ["command"],
              },
            });
          }

          if (settings.enableFileAccess) {
            skillDescription += " You can read, write, and list files.";
            functionDeclarations.push(
              {
                name: "read_file",
                description: "Read the contents of a file.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    path: {
                      type: "STRING",
                      description: "The path to the file.",
                    },
                  },
                  required: ["path"],
                },
              },
              {
                name: "write_file",
                description: "Write content to a file.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    path: {
                      type: "STRING",
                      description: "The path to the file.",
                    },
                    content: {
                      type: "STRING",
                      description: "The content to write.",
                    },
                  },
                  required: ["path", "content"],
                },
              },
              {
                name: "list_files",
                description: "List files in a directory.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    path: {
                      type: "STRING",
                      description: "The path to the directory.",
                    },
                  },
                  required: ["path"],
                },
              },
            );
          }

          tools.push({ functionDeclarations });
        }

        const geminiModel = genAI.getGenerativeModel({
          model: modelId,
          systemInstruction: `${systemPrompt}\n\nUser system locale: ${settings.locale || "en-US"}\n\n${skillDescription}`,
          tools,
          generationConfig: {
            temperature: temperature || 0.7,
          },
        });

        // 1. Systematically rebuild explicit history array
        const contents: Content[] = [];
        for (const m of messages) {
          const role = m.role === "assistant" ? "model" : "user";
          const text = m.content ? String(m.content).trim() : "";
          if (!text) continue;

          // Collapse consecutive roles to satisfy Gemini's strict alternation requirements
          if (contents.length > 0 && contents[contents.length - 1].role === role) {
            contents[contents.length - 1].parts[0].text += `\n${text}`;
          } else {
            contents.push({ role, parts: [{ text }] });
          }
        }

        if (contents.length === 0) return;

        // Gemini strictly requires the first turn to be 'user'
        if (contents[0].role !== "user") {
          contents.unshift({ role: "user", parts: [{ text: "(System UI Initialization)" }] });
        }

        // 2. Perform stateless stream request
        let result = await geminiModel.generateContentStream({ contents });

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            event.reply(`${IpcMessages.GEMINI_PROMPT_STREAMING}_CHUNK`, chunkText);
          }
        }

        const finalResponse = await result.response;
        const calls = finalResponse.functionCalls();

        // 3. Handle Tool Execution
        if (calls && calls.length > 0) {
          // Extract the exact parts (including functionCall metadata) the model just generated
          const modelParts = finalResponse.candidates?.[0]?.content?.parts || [];

          // Manually slot the model's output into our state tree
          contents.push({ role: "model", parts: modelParts });

          const functionResponses: any[] = [];

          for (const call of calls) {
            const { name, args } = call;
            let responseStr = "";
            const anyArgs = args as any;

            try {
              if (name === "execute_command") {
                responseStr = await handleExecuteCommand(anyArgs.command);
              } else if (name === "read_file") {
                responseStr = await handleReadFile(anyArgs.path);
              } else if (name === "write_file") {
                responseStr = await handleWriteFile(anyArgs.path, anyArgs.content);
              } else if (name === "list_files") {
                responseStr = await handleListFiles(anyArgs.path);
              } else {
                responseStr = `Error: Unknown tool ${name}`;
              }
            } catch (e: any) {
              responseStr = `Error executing tool: ${e.message}`;
            }

            functionResponses.push({
              functionResponse: {
                name,
                response: { name, content: String(responseStr) },
              },
            });
          }

          // Append our execution results as the user turn
          contents.push({ role: "user", parts: functionResponses });

          // 4. Stream the follow-up response back to the UI
          const nextResult = await geminiModel.generateContentStream({ contents });

          for await (const chunk of nextResult.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              event.reply(`${IpcMessages.GEMINI_PROMPT_STREAMING}_CHUNK`, chunkText);
            }
          }
        }

        event.reply(`${IpcMessages.GEMINI_PROMPT_STREAMING}_DONE`);
      } catch (error: any) {
        let errorMessage = "Unknown Gemini error";

        if (error.response) {
          try {
            const body = await error.response.json();
            if (body.error?.message) {
              errorMessage = body.error.message;
            } else if (Array.isArray(body) && body[0]?.error?.message) {
              errorMessage = body[0].error.message;
            } else {
              errorMessage = JSON.stringify(body, null, 2);
            }
          } catch {
            errorMessage = error.message || String(error);
          }
        } else if (error.message) {
          errorMessage = error.message;
        } else {
          errorMessage = String(error);
        }

        console.error("Gemini Error:", error);
        event.reply(
          `${IpcMessages.GEMINI_PROMPT_STREAMING}_ERROR`,
          errorMessage,
        );
      }
    },
  );
}

// Tool Handlers
// ---------------------------------------------------------------------------

async function handleExecuteCommand(command: string): Promise<string> {
  const settings = getStateManager().store.get("settings");
  if (!settings.enableTerminalAccess) {
    return "Error: Terminal access is disabled in settings.";
  }

  // Force use of /bin/bash -c
  const bashCommand = `/bin/bash -c "${command.replace(/"/g, '\\"')}"`;

  return new Promise((resolve) => {
    exec(bashCommand, (error, stdout, stderr) => {
      if (error) {
        resolve(`Error: ${error.message}\n${stderr}`);
      } else {
        resolve(stdout || stderr || "Command executed successfully (no output).");
      }
    });
  });
}

function isPathAllowed(filePath: string): boolean {
  const settings = getStateManager().store.get("settings");
  if (settings.allowRootAccess) return true;

  const homeDir = app.getPath("home");
  const userDataDir = app.getPath("userData");
  const resolvedPath = path.resolve(filePath);

  return (
    resolvedPath.startsWith(homeDir) || resolvedPath.startsWith(userDataDir)
  );
}

async function handleReadFile(filePath: string): Promise<string> {
  const settings = getStateManager().store.get("settings");
  if (!settings.enableFileAccess) {
    return "Error: File access is disabled in settings.";
  }

  if (!isPathAllowed(filePath)) {
    return "Error: Access to this path is restricted. Enable Root Access in settings to access files outside your home directory.";
  }

  try {
    return await fs.promises.readFile(filePath, "utf-8");
  } catch (error: any) {
    return `Error reading file: ${error.message}`;
  }
}

async function handleWriteFile(
  filePath: string,
  content: string,
): Promise<string> {
  const settings = getStateManager().store.get("settings");
  if (!settings.enableFileAccess) {
    return "Error: File access is disabled in settings.";
  }

  if (!isPathAllowed(filePath)) {
    return "Error: Access to this path is restricted.";
  }

  try {
    await fs.promises.writeFile(filePath, content, "utf-8");
    return "File written successfully.";
  } catch (error: any) {
    return `Error writing file: ${error.message}`;
  }
}

async function handleListFiles(dirPath: string): Promise<string> {
  const settings = getStateManager().store.get("settings");
  if (!settings.enableFileAccess) {
    return "Error: File access is disabled in settings.";
  }

  if (!isPathAllowed(dirPath)) {
    return "Error: Access to this path is restricted.";
  }

  try {
    const files = await fs.promises.readdir(dirPath);
    return files.join("\n");
  } catch (error: any) {
    return `Error listing files: ${error.message}`;
  }
}
