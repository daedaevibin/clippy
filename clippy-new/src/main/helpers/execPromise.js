"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execPromise = void 0;
const node_child_process_1 = require("node:child_process");
/**
 * Executes a command using exec and returns a promise that resolves with the output.
 *
 * @param cmd The command to execute.
 * @returns A promise that resolves with the command output.
 */
function execPromise(cmd) {
    return new Promise((resolve, reject) => {
        (0, node_child_process_1.exec)(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Stderr: ${stderr}`);
                return;
            }
            resolve(stdout);
        });
    });
}
exports.execPromise = execPromise;
