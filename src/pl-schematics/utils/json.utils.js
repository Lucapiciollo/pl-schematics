"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function readJsonFile(host, path) {
    const buffer = host.read(path);
    if (!buffer) {
        return null;
    }
    return JSON.parse(buffer.toString());
}
exports.readJsonFile = readJsonFile;
function overwriteJsonFile(host, path, json) {
    host.overwrite(path, JSON.stringify(json, null, 2));
}
exports.overwriteJsonFile = overwriteJsonFile;
function ensureArray(value) {
    return Array.isArray(value) ? value : [];
}
exports.ensureArray = ensureArray;
function pushIfMissing(array, value) {
    if (array.indexOf(value) < 0) {
        array.push(value);
    }
}
exports.pushIfMissing = pushIfMissing;
