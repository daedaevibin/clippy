"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.areAnyModelsReadyOrDownloading = exports.isModelReady = exports.isModelDownloading = void 0;
function isModelDownloading(model) {
    return (model && !!model.downloadState && model.downloadState.state !== "completed");
}
exports.isModelDownloading = isModelDownloading;
function isModelReady(model) {
    return (model &&
        model.downloaded &&
        (!model.downloadState || model.downloadState.state === "completed"));
}
exports.isModelReady = isModelReady;
function areAnyModelsReadyOrDownloading(models) {
    return Object.values(models).some((model) => {
        return model.downloaded || isModelDownloading(model);
    });
}
exports.areAnyModelsReadyOrDownloading = areAnyModelsReadyOrDownloading;
