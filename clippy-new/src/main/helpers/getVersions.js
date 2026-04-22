"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVersions = void 0;
const electron_1 = require("electron");
const getPackage_1 = require("./getPackage");
/**
 * Get the versions of the application
 *
 * @returns {Versions} The versions of the application
 */
async function getVersions() {
    const versions = {
        ...process.versions,
        clippy: electron_1.app.getVersion(),
        nodeLlamaCpp: await readPackageVersion("node-llama-cpp"),
    };
    return versions;
}
exports.getVersions = getVersions;
async function readPackageVersion(packageName) {
    const packageJson = await (0, getPackage_1.getPackageJson)(packageName);
    return packageJson?.version || null;
}
