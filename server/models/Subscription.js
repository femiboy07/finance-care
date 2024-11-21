"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const subscriptionSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'free', 'inactive']
    },
    subscriptionPlan: {
        type: String,
        enum: ['monthly', 'annual'],
        default: null
    },
    subscriptionEndDate: {
        type: Date,
    }
});
const subscription = mongoose_1.default.model('Subscription', subscriptionSchema);
exports.default = subscription;
