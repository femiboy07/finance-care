"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userNotifications = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User"
    },
    type: String,
    message: Object,
    status: {
        type: String,
        default: "unread"
    },
    createdAt: Date,
    updatedAt: Date,
});
const notification = mongoose_1.default.model('Notifications', userNotifications);
exports.default = notification;
