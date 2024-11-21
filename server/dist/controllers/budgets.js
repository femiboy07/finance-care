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
exports.getBudgets = getBudgets;
exports.updateBudget = updateBudget;
exports.calculateBudgetSummary = calculateBudgetSummary;
exports.deleteBudget = deleteBudget;
exports.clearAllBudgets = clearAllBudgets;
const Budgets_1 = __importDefault(require("../models/Budgets"));
const Transcation_1 = __importDefault(require("../models/Transcation"));
const Category_1 = __importDefault(require("../models/Category"));
const mongoose_1 = __importDefault(require("mongoose"));
const modify_1 = require("../utils/modify");
const findTransactionBudgets = (category, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryId = yield Category_1.default.findOne({ userId: userId, name: category });
    const alltransactionBudgets = yield Transcation_1.default.find({ category: categoryId === null || categoryId === void 0 ? void 0 : categoryId._id, userId: userId }).populate({ path: 'category', select: 'name type' });
    console.log(alltransactionBudgets);
    if (!alltransactionBudgets || alltransactionBudgets.length === 0) {
        return 0.0;
    }
    const getTotalSpent = alltransactionBudgets.reduce((acc, current) => {
        const amount = parseFloat(current.amount.toString());
        return acc + amount;
    }, 0);
    console.log(getTotalSpent, 'spent');
    return getTotalSpent;
});
function getBudgets(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const { year, month } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // Assuming `req.user` has been populated via authentication middleware.
            // Fetch all categories to show each one in the response, even if no budget entry exists.
            const allCategories = yield Category_1.default.find({});
            const definedYear = parseInt(year, 10);
            const definedMonth = parseInt(month, 10);
            // Set date range filters for the specified month and year
            const start = new Date(Date.UTC(definedYear, definedMonth - 1, 1));
            const end = new Date(Date.UTC(definedYear, definedMonth, 0, 23, 59, 59, 999));
            // Find budgets for this user, year, and month, grouped by category.
            const budget = yield Budgets_1.default.find({
                userId: userId,
                month: definedMonth,
                year: definedYear,
                // createdAt: { $gte: start, $lte: end },
            }).populate({ path: 'category', select: 'name type' }).lean();
            console.log(budget, "budgets");
            // Map each category to a budget entry, adding defaults for missing categories.
            const data = allCategories.map((category) => {
                const categoryBudget = budget.find((b) => b.category._id.toString() === category._id.toString());
                console.log(categoryBudget, 'categoryBudet');
                // const checkCategory=await transcation.find({category:category._id,month:definedMonth ,year:definedYear});
                // console.log(checkCategory,"checkcategory")
                // const amountReduce=checkCategory && checkCategory.reduce((prev:any,current:any)=>prev.amount + current.amount,0);
                // const convertReduce=toDecimal128(amountReduce);
                return {
                    category: category.name,
                    _id: categoryBudget === null || categoryBudget === void 0 ? void 0 : categoryBudget._id,
                    month: categoryBudget ? categoryBudget.month : null,
                    year: categoryBudget ? categoryBudget.year : null,
                    budget: categoryBudget ? categoryBudget.budget : new mongoose_1.default.Types.Decimal128("0.0"),
                    spent: categoryBudget ? categoryBudget.spent : new mongoose_1.default.Types.Decimal128("0.0"),
                    remaining: categoryBudget ? categoryBudget.remaining : new mongoose_1.default.Types.Decimal128("0.0"),
                };
            });
            return res.status(200).json({ data });
        }
        catch (err) {
            return res.status(500).json({ message: "System error, please try again later", err });
        }
    });
}
function updateBudget(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { category, amount, spent, remaining, year, month } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        console.log(spent, remaining, amount);
        try {
            const definedMonth = month;
            const definedYear = year;
            // Retrieve category by name and validate
            const categoryDoc = yield Category_1.default.findOne({ name: category, userId: null });
            if (!categoryDoc || !categoryDoc._id) {
                return res.status(400).json({ message: 'Category not found or invalid' });
            }
            // Ensure category ID is valid
            const categoryId = mongoose_1.default.isValidObjectId(categoryDoc._id)
                ? categoryDoc._id
                : new mongoose_1.default.Types.ObjectId();
            // Helper function to safely convert to Decimal128
            // Convert amounts safely
            const decimalAmount = (0, modify_1.toDecimal128)(amount);
            const decimalSpent = (0, modify_1.toDecimal128)(spent);
            const decimalRemaining = (0, modify_1.toDecimal128)(remaining);
            console.log(decimalAmount, decimalSpent, decimalRemaining, 'dd');
            // Check if a budget entry already exists for this category, user, year, and month;
            const prevBudget = yield Budgets_1.default.findOne({ category: categoryDoc._id, year: parseInt(definedYear, 10), month: parseInt(definedMonth, 10) + 1, userId });
            console.log(prevBudget === null || prevBudget === void 0 ? void 0 : prevBudget.spent.toString());
            let budgetEntry = yield Budgets_1.default.findOneAndUpdate({
                userId,
                category: categoryDoc._id,
                year: parseInt(definedYear, 10),
                month: parseInt(definedMonth, 10) + 1,
            }, {
                $set: {
                    budget: decimalAmount,
                    spent: decimalSpent,
                    remaining: prevBudget && prevBudget.spent.toString() !== "0.0" ? parseFloat(amount) - parseFloat(prevBudget.spent.toString()) : decimalRemaining,
                }
            }, { new: true, upsert: false });
            console.log(budgetEntry, 'entry');
            if (!budgetEntry) {
                // Update existing budget
                //lets check if this new budget created already has some transactions
                const checkCategory = yield Transcation_1.default.find({ category: categoryId, month: parseInt(definedMonth, 10) + 1, year: parseInt(definedYear, 10) });
                console.log(checkCategory, "checkcategory");
                const amountReduce = checkCategory && checkCategory.reduce((prev, current) => prev.amount + current.amount, 0);
                const convertReduce = (0, modify_1.toDecimal128)(amountReduce);
                // Create new budget if none exists
                const newBudget = new Budgets_1.default({
                    userId,
                    category: categoryId,
                    budget: decimalAmount,
                    spent: convertReduce ? parseFloat(convertReduce === null || convertReduce === void 0 ? void 0 : convertReduce.toString()) : decimalSpent,
                    remaining: convertReduce && decimalAmount && (decimalAmount === null || decimalAmount === void 0 ? void 0 : decimalAmount.toString()) !== '0.0' ? parseFloat(decimalAmount === null || decimalAmount === void 0 ? void 0 : decimalAmount.toString()) - parseFloat(convertReduce.toString()) : decimalRemaining,
                    year: parseInt(definedYear, 10),
                    month: parseInt(definedMonth, 10) + 1,
                });
                yield newBudget.save();
                return res.status(201).json({ message: 'Budget created', data: newBudget });
            }
            return res.status(200).json({ message: 'Budget updated', data: budgetEntry });
        }
        catch (error) {
            console.error('Error in updateBudget:', error);
            return res.status(500).json({ error: 'Failed to upsert budget', details: error.message });
        }
    });
}
function calculateBudgetSummary(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const { category } = req.query;
        if (!category) {
            return res.status(400).json({ message: "Category is required..." });
        }
        try {
            const totalBudgetResult = yield Budgets_1.default.aggregate([
                { $match: { category } },
                { $group: { _id: null, totalBudget: { $sum: "$amount" } } }
            ]);
            const totalBudget = ((_a = totalBudgetResult[0]) === null || _a === void 0 ? void 0 : _a.totalBudget) || 0;
            const totalSpentResult = yield Transcation_1.default.aggregate([
                { $match: { category } },
                { $group: { _id: null, totalSpent: { $sum: "$amount" } } }
            ]);
            const totalSpent = ((_b = totalSpentResult[0]) === null || _b === void 0 ? void 0 : _b.totalSpent) || 0;
            const remainingBudget = totalBudget - totalSpent;
            const remainingBudgetPercentage = totalBudget > 0
                ? (remainingBudget / totalBudget) * 100
                : 0;
            return res.status(200).json({
                totalBudget,
                totalSpent,
                remainingBudget,
                remainingBudgetPercentage
            });
        }
        catch (err) {
            return res.status(500).json({ message: "System error, please try again later", err });
        }
    });
}
function deleteBudget(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Budget ID is required..." });
        }
        try {
            const result = yield Budgets_1.default.findOneAndUpdate({
                _id: id
            }, {
                $set: {
                    budget: new mongoose_1.default.Types.Decimal128("0.0"),
                    remaining: new mongoose_1.default.Types.Decimal128("0.0"),
                }
            }, { upsert: false, new: true });
            if (!result) {
                return res.status(404).json({ message: "Cant unset this it has no budget for it..." });
            }
            return res.status(200).json({ message: "Budget deleted successfully..." });
        }
        catch (err) {
            return res.status(500).json({ message: "System error, please try again later", err });
        }
    });
}
function clearAllBudgets(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { month, year } = req.body;
        try {
            const unsetAllbudget = yield Budgets_1.default.updateMany({ month: month, year: year }, { $set: {
                    budget: new mongoose_1.default.Types.Decimal128("0.0"),
                    remaining: new mongoose_1.default.Types.Decimal128("0.0"),
                } }, { upsert: false, new: true });
            if (!unsetAllbudget) {
                return res.status(404).json({ message: "An error occured trying to clear all budgets...." });
            }
            return res.status(200).json({ message: "Budget cleared successfully..." });
        }
        catch (err) {
            return res.status(500).json({ message: "System error, please try again later", err });
        }
    });
}
