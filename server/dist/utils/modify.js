"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDecimal128 = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const toDecimal128 = (value) => {
    if (typeof value === 'number' || (typeof value === 'string' && value.trim() && !isNaN(Number(value)))) {
        return new mongoose_1.default.Types.Decimal128(`${value}`);
    }
    return undefined;
};
exports.toDecimal128 = toDecimal128;
