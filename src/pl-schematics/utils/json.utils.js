"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsonc = parseJsonc;
exports.readJsonFile = readJsonFile;
exports.overwriteJsonFile = overwriteJsonFile;
exports.ensureArray = ensureArray;
exports.pushIfMissing = pushIfMissing;
const jsonc_parser_1 = require("jsonc-parser");
const FORMATTING_OPTIONS = { insertSpaces: true, tabSize: 2, eol: '\n' };
function parseJsonc(content, path = '<json>') {
    const errors = [];
    const result = (0, jsonc_parser_1.parse)(content, errors, { allowTrailingComma: true });
    if (errors.length > 0) {
        throw new Error('Invalid JSON in "' + path + '": ' + (0, jsonc_parser_1.printParseErrorCode)(errors[0].error) +
            ' at offset ' + errors[0].offset + '.');
    }
    return result;
}
function readJsonFile(host, path) {
    const buffer = host.read(path);
    if (!buffer) {
        return null;
    }
    return parseJsonc(buffer.toString(), path);
}
function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function deepEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
function applyDiff(text, before, after, path) {
    if (isPlainObject(before) && isPlainObject(after)) {
        let current = text;
        Object.keys(before).forEach((key) => {
            if (!(key in after)) {
                current = (0, jsonc_parser_1.applyEdits)(current, (0, jsonc_parser_1.modify)(current, [...path, key], undefined, { formattingOptions: FORMATTING_OPTIONS }));
            }
        });
        Object.keys(after).forEach((key) => {
            if (!(key in before)) {
                current = (0, jsonc_parser_1.applyEdits)(current, (0, jsonc_parser_1.modify)(current, [...path, key], after[key], { formattingOptions: FORMATTING_OPTIONS }));
            }
            else if (!deepEqual(before[key], after[key])) {
                current = applyDiff(current, before[key], after[key], [...path, key]);
            }
        });
        return current;
    }
    if (deepEqual(before, after)) {
        return text;
    }
    return (0, jsonc_parser_1.applyEdits)(text, (0, jsonc_parser_1.modify)(text, path, after, { formattingOptions: FORMATTING_OPTIONS }));
}
function overwriteJsonFile(host, path, json) {
    const buffer = host.read(path);
    if (!buffer) {
        host.create(path, JSON.stringify(json, null, 2) + '\n');
        return;
    }
    const original = buffer.toString();
    const before = parseJsonc(original, path);
    const updated = applyDiff(original, before, json, []);
    if (updated !== original) {
        host.overwrite(path, updated);
    }
}
function ensureArray(value) {
    return Array.isArray(value) ? value : [];
}
function pushIfMissing(array, value) {
    if (array.indexOf(value) < 0) {
        array.push(value);
    }
}
