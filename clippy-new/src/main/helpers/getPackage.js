"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageJson = exports.getPackagePath = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../logger");
const electron_1 = require("electron");
/**
 * Get the path to a package in the node_modules directory
 *
 * @param packageName The name of the package
 * @returns {string | null} The path to the package or null if not found
 */
function getPackagePath(packageName) {
    try {
        const packagePath = path_1.default.join(electron_1.app.getAppPath(), "node_modules", packageName);
        if (!fs_1.default.existsSync(packagePath)) {
            throw new Error(`Package not found at ${packagePath}`);
        }
        return packagePath;
    }
    catch (error) {
        (0, logger_1.getLogger)().warn(`Failed to read package path for ${packageName}`, error);
    }
    return null;
}
exports.getPackagePath = getPackagePath;
/**
 * Get the package.json file for a given package
 *
 * @param packageName The name of the package
 * @returns {Promise<PackageJson | null>} The package.json file or null if not found
 */
async function getPackageJson(packageName) {
    let result = null;
    try {
        const packagePath = getPackagePath(packageName);
        if (!packagePath) {
            throw new Error(`Could not find package path for ${packageName}`);
        }
        const packageJsonPath = path_1.default.join(packagePath, "package.json");
        if (fs_1.default.existsSync(packageJsonPath)) {
            const packageJsonString = await fs_1.default.promises.readFile(packageJsonPath, "utf-8");
            result = JSON.parse(packageJsonString);
        }
        else {
            throw new Error(`Could not find package.json for ${packageName} in ${packageJsonPath}`);
        }
    }
    catch (error) {
        (0, logger_1.getLogger)().warn(`Failed to read package for ${packageName}`, error);
    }
    return result;
}
exports.getPackageJson = getPackageJson;
