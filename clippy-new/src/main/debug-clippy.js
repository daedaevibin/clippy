"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClippyDebugInfo = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("./logger");
/**
 * Get debug information for the Llama binary
 *
 * @returns {Promise<ClippyDebugInfo>} The debug information
 */
async function getClippyDebugInfo() {
    const debugInfo = {
        platform: process.platform,
        arch: process.arch,
        versions: process.versions,
        llamaBinaries: await getNodeLlamaBinaries(),
        llamaBinaryFiles: {},
        checks: await getDebugChecks(),
        gpu: await electron_1.app.getGPUInfo("complete"),
    };
    for (const llamaBinary of debugInfo.llamaBinaries) {
        debugInfo.llamaBinaryFiles[llamaBinary] =
            await getLlamaBinaryFiles(llamaBinary);
    }
    return debugInfo;
}
exports.getClippyDebugInfo = getClippyDebugInfo;
/**
 * Runs a series of checks to determine the state of the environment
 * and the availability of certain packages.
 *
 * @returns {Promise<Record<string, boolean | string>>} An object containing the results of the checks.
 *          Each key is the name of the check, and the value is either a boolean
 *          indicating success or failure, or a string describing the error.
 */
async function getDebugChecks() {
    const checks = {};
    const checksToRun = [
        {
            name: "can-require-node-llama-cpp",
            check: async () => !!(await Promise.resolve().then(() => __importStar(require("node-llama-cpp")))),
        },
        {
            name: "can-see-node-modules-folder",
            check: () => !!getNodeModulesPath(),
        },
        {
            name: "can-see-node-llama-binaries",
            check: async () => (await getNodeLlamaBinaries()).length > 0,
        },
    ];
    for (const { name, check } of checksToRun) {
        try {
            const result = await check();
            checks[name] = !!result;
        }
        catch (error) {
            (0, logger_1.getLogger)().log(`Error running check ${name}:`, error);
            checks[name] = `${error}`;
        }
    }
    return checks;
}
/**
 * Returns the folders inside the @node-llama-cpp directory
 *
 * @returns {Promise<Array<string>>} An array of folder names inside the @node-llama-cpp directory
 */
async function getNodeLlamaBinaries() {
    const folders = [];
    try {
        const nodeModulesPath = getNodeModulesPath();
        const llamaCppPath = path_1.default.join(nodeModulesPath, "@node-llama-cpp");
        if (!fs_1.default.existsSync(llamaCppPath)) {
            throw new Error(`@node-llama-cpp directory not found at ${llamaCppPath}`);
        }
        for (const entry of await fs_1.default.promises.readdir(llamaCppPath)) {
            const entryPath = path_1.default.join(llamaCppPath, entry);
            if (fs_1.default.statSync(entryPath).isDirectory()) {
                folders.push(entry);
            }
        }
        return folders;
    }
    catch (error) {
        (0, logger_1.getLogger)().warn("Error reading @node-llama-cpp directory:", error);
    }
    return folders;
}
/**
 * Returns the files inside the llama binary directory
 *
 * @param {string} llamaBinary - The name of the llama binary
 * @returns {Promise<NestedRecord<number>>} An object representing the files and their sizes
 */
async function getLlamaBinaryFiles(llamaBinary) {
    try {
        const nodeModulesPath = getNodeModulesPath();
        const llamaBinaryPath = path_1.default.join(nodeModulesPath, "@node-llama-cpp", llamaBinary);
        if (!fs_1.default.existsSync(llamaBinaryPath)) {
            throw new Error(`Llama binary directory not found at ${llamaBinaryPath}`);
        }
        return readDirectory(llamaBinaryPath);
    }
    catch (error) {
        (0, logger_1.getLogger)().warn("Error reading llama binary directory:", error);
        return {
            error: -1,
        };
    }
}
/**
 * UNSAFE HELPERS
 */
/**
 * Get the path to the node_modules directory
 *
 * @returns {string} The path to the node_modules directory
 * @throws {Error} If the node_modules directory cannot be found
 */
function getNodeModulesPath() {
    const nodeModulesPath = path_1.default.join(electron_1.app.getAppPath(), "node_modules");
    if (!fs_1.default.existsSync(nodeModulesPath)) {
        throw new Error(`node_modules directory not found at ${nodeModulesPath}`);
    }
    return nodeModulesPath;
}
/**
 * Recursively reads a directory and returns its contents as a nested object.
 *
 * @param {string} dir - The directory to read.
 * @returns {Promise<NestedRecord<number>>} A promise that resolves to an object
 *          representing the directory contents.
 */
async function readDirectory(dir) {
    const result = {};
    try {
        for (const entry of await fs_1.default.promises.readdir(dir)) {
            const entryPath = path_1.default.join(dir, entry);
            const stat = await fs_1.default.promises.stat(entryPath);
            if (fs_1.default.statSync(entryPath).isDirectory()) {
                result[entry] = await readDirectory(entryPath);
            }
            else {
                result[entry] = stat.size;
            }
        }
    }
    catch (error) {
        (0, logger_1.getLogger)().warn("Error reading directory:", error);
        result["error"] = -1;
    }
    return result;
}
