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
exports.seedCategories = seedCategories;
exports.clearCategories = clearCategories;
const Category_1 = __importDefault(require("../models/Category"));
const defaultCategories = [
    { name: 'Food', type: 'expense', userId: null },
    { name: 'Transportation', type: 'expense', userId: null },
    { name: 'Salary', type: 'income', userId: null },
    { name: 'Entertainment', type: 'expense', userId: null },
    { name: 'CoffeeShops', type: 'expense', userId: null },
    { name: 'Income', type: 'income', userId: null },
    { name: 'Food', type: 'expense', userId: null },
    { name: 'Rent', type: 'expense', userId: null },
    { name: 'deposit', type: 'expense', userId: null },
    { name: 'PaymentTransfer', type: 'expense', userId: null },
    { name: 'Groceries', type: 'income', userId: null },
    { name: 'Withdrawal', type: 'expense', userId: null },
    { name: 'Travel', type: 'expense', userId: null },
    { name: 'Gifts', type: 'expense', userId: null },
    { name: 'Resturants', type: 'expense', userId: null },
    { name: 'Personal Care', type: 'expense', userId: null },
    { name: 'Gas, Transportation', type: 'expense', userId: null },
    { name: 'Bank Fees', type: 'income', userId: null },
    { name: 'Shopping', type: 'expense', userId: null },
];
function seedCategories() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            for (const category of defaultCategories) {
                const existingCategory = yield Category_1.default.findOne({
                    name: category.name,
                    userId: null,
                });
                if (!existingCategory) {
                    yield Category_1.default.create(category);
                    console.log(`Category ${category.name} added to the database.`);
                }
            }
        }
        catch (error) {
            console.error("Error seeding categories:", error);
        }
    });
}
function clearCategories() {
    return __awaiter(this, void 0, void 0, function* () {
        yield Category_1.default.deleteMany({ userId: null }); // Optionally clear global categories
    });
}
