"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDecimal128 = void 0;
exports.generateToken = generateToken;
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const toDecimal128 = (value) => {
    if (typeof value === 'number' || (typeof value === 'string' && value.trim() && !isNaN(Number(value)))) {
        return new mongoose_1.default.Types.Decimal128(`${value}`);
    }
    return undefined;
};
exports.toDecimal128 = toDecimal128;
function generateToken(payload, expiry) {
    return jsonwebtoken_1.default.sign(payload, process.env.SECRET_KEY, { expiresIn: expiry });
}
