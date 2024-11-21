"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationMessage = exports.modifMessages = void 0;
const Notifications_1 = __importDefault(require("../models/Notifications"));
const modifMessages = (message) => {
    return ``;
};
exports.modifMessages = modifMessages;
const sendNotificationMessage = (io, userId, message, type) => __awaiter(void 0, void 0, void 0, function* () {
    switch (type) {
        case "transaction_alert":
            const modifiedmessage = {
                title: "New Transaction Alert",
                message: `You have a new transaction of ${message.amount} for '${message.category}'.`,
                action: "View Details",
                details: {
                    amount: message.amount,
                    category: message.category,
                    date: message.date,
                    description: message.description,
                }
            };
            const transactionNotify = yield Notifications_1.default.create({
                userId: userId,
                type,
                message: modifiedmessage,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            io.to(userId.toString()).emit('notification', modifiedmessage);
            yield transactionNotify.save();
        default:
            return null;
    }
});
exports.sendNotificationMessage = sendNotificationMessage;
