"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const accountsSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        unique: true,
        default: "current",
    },
    isSystemAccount: {
        type: Boolean,
        default: false,
    },
    balance: {
        type: mongoose_1.default.Types.Decimal128,
        default: 0,
        required: true,
        max: 15
    },
    transcations: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Transcations",
        }],
    budgets: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Budgets"
        }],
});
const accounts = mongoose_1.default.model('Accounts', accountsSchema);
exports.default = accounts;
