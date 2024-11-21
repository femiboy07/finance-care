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
exports.seedDefaultBudget = void 0;
exports.clearBudgets = clearBudgets;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User")); // Ensure the User model is imported
const Category_1 = __importDefault(require("../models/Category")); // Ensure the Category model is imported
const Budgets_1 = __importDefault(require("../models/Budgets")); // Your userBudgets schema model
// Default budget values
const defaultBudgetAmount = new mongoose_1.default.Types.Decimal128("0.0"); // Default amount
const defaultSpent = new mongoose_1.default.Types.Decimal128("0.0");
const defaultRemaining = defaultBudgetAmount;
const seedDefaultBudget = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find({}); // Get all users
        const categories = yield Category_1.default.find({}); // Get all categories
        for (const user of users) {
            for (const category of categories) {
                // Check if the budget exists for the user and category
                const existingBudget = yield Budgets_1.default.findOne({
                    userId: user._id,
                    category: category._id,
                });
                if (!existingBudget) {
                    // Create a new budget document with default values
                    yield Budgets_1.default.create({
                        userId: user._id,
                        category: category._id,
                        budget: defaultBudgetAmount,
                        spent: defaultSpent,
                        remaining: defaultRemaining,
                    });
                    console.log(`Default budget created for user ${user._id} and category ${category.name}`);
                }
            }
        }
        console.log("Budget seeding complete.");
    }
    catch (error) {
        console.error("Error seeding budgets:", error);
    }
});
exports.seedDefaultBudget = seedDefaultBudget;
function clearBudgets() {
    return __awaiter(this, void 0, void 0, function* () {
        yield Budgets_1.default.deleteMany(); // Optionally clear global categories
    });
}
