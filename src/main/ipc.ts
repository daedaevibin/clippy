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
import { GoogleGenerativeAI, Content, Part, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { app } from "electron";

// Helper to map UI messages to Gemini Content objects
function mapToGeminiRole(role: string): string {
  switch (role) {
    case "assistant":
      return "model";
    case "function":
      return "function";
    default:
      return "user";
  }
}

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
            IpcMessages.GEMINI_PROMPT_STREAMING_ERROR,
            "No Gemini API key found in settings.",
          );
          return;
        }

        // @ts-ignore - Some SDK versions use this to specify the API version
        const genAI = new GoogleGenerativeAI(apiKey, { apiVersion: "v1beta" });

        let modelId = "gemini-2.5-flash"; // default
        const lowerModel = model.toLowerCase();

        if (model.startsWith("gemini-")) {
          // Use provided model ID directly
          modelId = model;
        } else if (lowerModel.includes("3.1")) {
          if (lowerModel.includes("pro")) {
            modelId = "gemini-3.1-pro-preview";
          } else {
            modelId = "gemini-3.1-flash-lite-preview";
          }
        } else if (lowerModel.includes("3.0")) {
          if (lowerModel.includes("pro")) {
            modelId = "gemini-3-pro-preview";
          } else {
            modelId = "gemini-3-flash-preview";
          }
        } else if (lowerModel.includes("2.5")) {
          if (lowerModel.includes("pro")) {
            modelId = "gemini-2.5-pro";
          } else {
            modelId = "gemini-2.5-flash";
          }
        } else if (lowerModel.includes("2.0")) {
          if (lowerModel.includes("pro")) {
            modelId = "gemini-2.0-pro-exp";
          } else {
            modelId = "gemini-2.0-flash";
          }
        } else if (lowerModel.includes("pro")) {
          modelId = "gemini-3.1-pro-preview";
        } else if (lowerModel.includes("flash")) {
          modelId = "gemini-2.5-flash";
        }

        console.log("[IPC] Selected Gemini model ID:", modelId);

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

        const fullSystemPrompt = `${systemPrompt}\n\nUser system locale: ${settings.locale || "en-US"}\n\n${skillDescription}`;

        const geminiModel = genAI.getGenerativeModel({
          model: modelId,
          systemInstruction: fullSystemPrompt,
          tools,
          generationConfig: {
            temperature: temperature || 0.7,
          },
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
          ],
        });

        // Map messages to Gemini history and filter out empty ones
        const mappedHistory: Content[] = [];
        for (const m of messages) {
          const role = mapToGeminiRole(m.role || (m.sender === "clippy" ? "assistant" : "user"));
          const parts: Part[] = [];

          if (m.content) {
            parts.push({ text: String(m.content).trim() });
          }

          if (m.toolCalls && m.toolCalls.length > 0) {
            for (const call of m.toolCalls) {
              parts.push({
                functionCall: {
                  name: call.name,
                  args: call.args,
                },
              });
            }
          }

          if (parts.length > 0) {
            mappedHistory.push({ role, parts });
          }

          if (m.toolResults && m.toolResults.length > 0) {
            const resultParts: Part[] = [];
            for (const res of m.toolResults) {
              resultParts.push({
                functionResponse: {
                  name: res.name,
                  response: { result: String(res.result) },
                },
              });
            }
            mappedHistory.push({ role: "function", parts: resultParts });
          }
        }

        if (mappedHistory.length === 0) {
          event.reply(IpcMessages.GEMINI_PROMPT_STREAMING_DONE);
          return;
        }

        // 1. Ensure the first message is 'user'. Gemini requires history to start with a user message.
        while (mappedHistory.length > 0 && mappedHistory[0].role !== "user") {
          mappedHistory.shift();
        }

        if (mappedHistory.length === 0) {
          event.reply(IpcMessages.GEMINI_PROMPT_STREAMING_DONE);
          return;
        }

        // 2. Ensure alternating roles by merging consecutive messages with the same role
        const consolidatedHistory: Content[] = [];
        for (const content of mappedHistory) {
          if (consolidatedHistory.length > 0 && consolidatedHistory[consolidatedHistory.length - 1].role === content.role) {
            consolidatedHistory[consolidatedHistory.length - 1].parts.push(...content.parts);
          } else {
            consolidatedHistory.push(content);
          }
        }

        // 3. Take the last message as the current prompt
        const lastMessage = consolidatedHistory.pop();
        if (
          !lastMessage ||
          !lastMessage.parts[0] ||
          !("text" in lastMessage.parts[0])
        ) {
          event.reply(IpcMessages.GEMINI_PROMPT_STREAMING_DONE);
          return;
        }

        const history: Content[] = consolidatedHistory;
        let currentParts: Part[] = lastMessage.parts;

        // Automatic Multi-round Tool Execution
        let isDone = false;
        let round = 1;
        while (!isDone) {
          const contents = [...history];
          if (currentParts.length > 0) {
            contents.push({ role: "user", parts: currentParts });
          }

          const result = await geminiModel.generateContentStream({
            contents,
          });

          let accumulatedText = "";
          let accumulatedThought = "";
          const accumulatedParts: Part[] = [];

          for await (const chunk of result.stream) {
            if (chunk.candidates?.[0]?.content?.parts) {
              for (const part of chunk.candidates[0].content.parts) {
                accumulatedParts.push(part);
                if ("text" in part && part.text) {
                  accumulatedText += part.text;
                  event.reply(
                    IpcMessages.GEMINI_PROMPT_STREAMING_CHUNK,
                    part.text,
                  );
                }
                if ("thought" in part && (part as any).thought) {
                  accumulatedThought += (part as any).thought;
                  event.reply(
                    IpcMessages.GEMINI_PROMPT_STREAMING_THOUGHT,
                    (part as any).thought,
                  );
                }
              }
            } else if (chunk.candidates?.[0]?.finishReason) {
              if (chunk.candidates[0].finishReason === "SAFETY") {
              }
            }
          }

          // Add the turns to history
          if (currentParts.length > 0) {
            history.push({ role: "user", parts: currentParts });
          }
          history.push({ role: "model", parts: accumulatedParts });

          const response = await result.response;
          const calls = response.functionCalls();

          if (!accumulatedText && !accumulatedThought && (!calls || calls.length === 0)) {
            event.reply(
              IpcMessages.GEMINI_PROMPT_STREAMING_CHUNK,
              "No response received from Gemini.",
            );
          }

          if (calls && calls.length > 0) {
            const functionResponses: Part[] = [];

            for (const call of calls) {
              const { name, args } = call;
              const anyArgs = args as any;
              let responseStr = "";

              event.reply(IpcMessages.GEMINI_PROMPT_STREAMING_TOOL_CALL, { name, args: anyArgs });

              try {
                switch (name) {
                  case "execute_command":
                    responseStr = await handleExecuteCommand(anyArgs.command);
                    break;
                  case "read_file":
                    responseStr = await handleReadFile(anyArgs.path);
                    break;
                  case "write_file":
                    responseStr = await handleWriteFile(
                      anyArgs.path,
                      anyArgs.content,
                    );
                    break;
                  case "list_files":
                    responseStr = await handleListFiles(anyArgs.path);
                    break;
                  default:
                    responseStr = `Error: Unknown tool ${name}`;
                }
              } catch (e: any) {
                responseStr = `Error executing tool: ${e.message}`;
              }

              event.reply(IpcMessages.GEMINI_PROMPT_STREAMING_TOOL_RESULT, { name, result: responseStr });

              functionResponses.push({
                functionResponse: {
                  name,
                  response: { result: String(responseStr) },
                },
              });
            }

            // For the next round, the "user" parts will actually be the function responses
            // In Gemini history, function responses have role "function"
            // So we add them to history and then call generateContentStream
            history.push({ role: "function", parts: functionResponses });

            // To continue the loop, we need to provide a new turn.
            // Since we already added the function response to history,
            // we can just pass an empty parts array for the next round? No.
            // Actually, the next call should just have the history.
            currentParts = []; // The actual content is already in history
            round++;
          } else {
            isDone = true;
          }
        }

        event.reply(IpcMessages.GEMINI_PROMPT_STREAMING_DONE);
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

        event.reply(IpcMessages.GEMINI_PROMPT_STREAMING_ERROR, errorMessage);
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

  return new Promise((resolve) => {
    const child = spawn("/bin/bash", ["-c", command]);
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        resolve(`Error (exit code ${code}): ${stderr || stdout}`);
      } else {
        resolve(
          stdout || stderr || "Command executed successfully (no output).",
        );
      }
    });

    child.on("error", (err) => {
      resolve(`Error: ${err.message}`);
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

