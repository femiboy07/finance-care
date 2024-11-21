"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.value = exports.transcationCategory = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var transcationCategory;
(function (transcationCategory) {
    transcationCategory["Food"] = "Food";
    transcationCategory["Rent"] = "Rent";
    transcationCategory["Salary"] = "Salary";
    transcationCategory["Entertainment"] = "Entertainment";
    transcationCategory["BankFees"] = "Bank Fees";
    transcationCategory["CoffeeShops"] = "CoffeeShops";
    transcationCategory["deposit"] = "deposit";
    transcationCategory["Income"] = "Income";
    transcationCategory["PaymentTransfer"] = "PaymentTransfer";
    transcationCategory["Withdrawal"] = "Withdrawal";
    transcationCategory["Travel"] = "Travel";
    transcationCategory["PersonalCare"] = "Personal Care";
    transcationCategory["Transportation"] = "Transportation";
    transcationCategory["Resturants"] = "Resturants";
})(transcationCategory || (exports.transcationCategory = transcationCategory = {}));
exports.value = ['Food', "Rent", 'Salary', 'Entertainment', 'BankFees', 'CoffeeShops', 'deposit', 'Income', 'PaymentTransfer', 'Withdrawal', 'Travel', 'Personal Care', 'Transportation', 'Resturants'];
var typeTranscation;
(function (typeTranscation) {
    typeTranscation["expense"] = "expense";
    typeTranscation["income"] = "income";
})(typeTranscation || (typeTranscation = {}));
var statusTranscation;
(function (statusTranscation) {
    statusTranscation["pending"] = "pending";
    statusTranscation["cleared"] = "cleared";
})(statusTranscation || (statusTranscation = {}));
const userTranscations = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    accountId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Accounts",
    },
    month: {
        type: Number,
    },
    year: {
        type: Number,
    },
    type: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    amount: {
        type: mongoose_1.default.Types.Decimal128,
        required: true,
        max: 15
    },
    category: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    status: {
        type: String,
        enum: statusTranscation,
        default: statusTranscation.pending,
    },
    description: {
        type: String,
        required: false
        //   required:true,
    },
    date: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });
userTranscations.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(this);
            // Use `await` to wait for the `populate` method to complete
            yield this.populate({
                path: 'accountId', // First, populate the `accountId` field
                select: 'name' // Specify that we only want the `name` field from `accountId`
            });
            next();
        }
        catch (error) {
            // Pass any errors to the next middleware
            next(error);
        }
    });
});
const transcation = mongoose_1.default.model('Transcation', userTranscations);
exports.default = transcation;
