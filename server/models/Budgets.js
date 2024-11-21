"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userBudgets = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    category: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Category",
        required: true,
        default: "",
    },
    budget: {
        type: mongoose_1.default.Types.Decimal128,
        default: '',
        required: true,
    },
    month: {
        type: Number,
    },
    year: {
        type: Number,
    },
    spent: {
        type: mongoose_1.default.Types.Decimal128,
        default: 0.0,
        required: true,
    },
    remaining: {
        type: mongoose_1.default.Types.Decimal128,
        default: 0.0,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true
});
userBudgets.pre('validate', function (next) {
    //    if (this.period === 'custom') {
    //        if (!this.startDate || !this.endDate) {
    //            return next(new Error('Start date and end date are required for custom period.'));
    //        }
    //        if (new Date(this.startDate) >= new Date(this.endDate)) {
    //            return next(new Error('Start date must be before end date.'));
    //        }
    //    } else {
    //        // If period is not 'custom', ensure dates are not provided
    //        if (this.startDate || this.endDate) {
    //            return next(new Error('Start date and end date should not be provided for non-custom periods.'));
    //        }
    //    }
    next();
});
const budgets = mongoose_1.default.model("Budgets", userBudgets);
exports.default = budgets;
