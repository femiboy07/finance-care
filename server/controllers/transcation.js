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
exports.convertToNumber = void 0;
exports.createTranscation = createTranscation;
exports.updateTransaction = updateTransaction;
exports.deleteTranscation = deleteTranscation;
exports.getLatestTransactions = getLatestTransactions;
exports.getTranscations = getTranscations;
exports.metrics = metrics;
exports.csvExportTransaction = csvExportTransaction;
const Transcation_1 = __importDefault(require("../models/Transcation"));
const mongoose_1 = __importDefault(require("mongoose"));
const notifications_1 = require("./notifications");
const Account_1 = __importDefault(require("../models/Account"));
const decimal_js_1 = require("decimal.js");
const Budgets_1 = __importDefault(require("../models/Budgets"));
const Category_1 = __importDefault(require("../models/Category"));
const modify_1 = require("../utils/modify");
const date_fns_tz_1 = require("date-fns-tz");
const json_2_csv_1 = require("json-2-csv");
/**
 *
 * @param req
 * create a transcation using out create transcation api;
 * @param res
 * @returns
 */
const convertToNumber = (value) => {
    if (value && typeof value.toString === 'function') {
        return parseFloat(value.toString());
    }
    return value;
};
exports.convertToNumber = convertToNumber;
function createTranscation(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const { type, amount, description, category, accountId, date, month, year } = req.body;
        console.log(date, "ass");
        // Validate request fields
        if (!type || !amount || !category || !date || !accountId || !month || !year) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        try {
            const definedYear = year;
            const definedMonth = month;
            console.log(definedYear, definedMonth, 'year,month');
            const account = yield Account_1.default.findOne({ _id: accountId });
            ;
            if (!account) {
                return res.status(404).json({ message: "Account not found or access denied" });
            }
            if (!['income', 'expense'].includes(type.toLowerCase())) {
                return res.status(403).json({ message: "Transaction type must be 'income' or 'expense'" });
            }
            const categoryDoc = yield Category_1.default.findOne({ name: category, userId: null });
            if (!categoryDoc || !categoryDoc._id) {
                return res.status(400).json({ message: 'Category not found or invalid' });
            }
            const categoryId = categoryDoc._id;
            const currentBalance = new decimal_js_1.Decimal(account.balance.toString());
            if (type.toLowerCase() === 'expense' && currentBalance.lessThan(amount)) {
                return res.status(400).json({ message: "Insufficient funds in the account" });
            }
            const newTransaction = new Transcation_1.default({
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                accountId,
                type,
                name: account.name,
                amount,
                description,
                category: categoryId,
                date: date,
                month: parseInt(definedMonth, 10) + 1,
                year: parseInt(definedYear, 10),
            });
            yield deductBalance(accountId, amount, currentBalance.toString(), type);
            newTransaction.status = "cleared";
            yield newTransaction.save();
            // Find existing budget to calculate the remaining amount
            const existingBudget = yield Budgets_1.default.findOne({ userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id, category: categoryId, month: newTransaction.month, year: newTransaction.year });
            if (existingBudget) {
                // Calculate updated spent and remaining amounts
                const updatedSpent = (0, exports.convertToNumber)(existingBudget.spent) + (0, exports.convertToNumber)(amount);
                const updatedRemaining = (0, exports.convertToNumber)(existingBudget.budget) - updatedSpent;
                // Update the budget entry
                yield Budgets_1.default.findOneAndUpdate({ _id: existingBudget._id }, {
                    $set: {
                        spent: updatedSpent,
                        remaining: existingBudget.budget.toString() !== '0.0' ? updatedRemaining : new mongoose_1.default.Types.Decimal128("0.0"),
                    },
                }, { new: true, upsert: false });
            }
            else {
                const newBudget = new Budgets_1.default({
                    userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id,
                    spent: amount,
                    remaining: new mongoose_1.default.Types.Decimal128("0.0"),
                    budget: new mongoose_1.default.Types.Decimal128("0.0"),
                    category: categoryId,
                    month: newTransaction.month,
                    year: newTransaction.year,
                });
                yield newBudget.save();
                // No budget entry exists, so only create the transaction
                // sendNotificationMessage(req.io, req.user?._id!, newTransaction, "transaction_alert");
                // return res.status(200).json({ data: newTransaction, message: "New transaction created successfully" });
            }
            (0, notifications_1.sendNotificationMessage)(req.io, (_d = req.user) === null || _d === void 0 ? void 0 : _d._id, newTransaction, "transaction_alert");
            return res.status(200).json({ data: newTransaction, message: "Transaction created and budget updated successfully" });
        }
        catch (err) {
            console.log(err, 'error');
            if (err.name === 'ValidationError') {
                const errors = Object.keys(err.errors).map((key) => ({
                    field: key,
                    message: err.errors[key].message,
                }));
                return res.status(400).json({ errors });
            }
            return res.status(400).json({ message: "Network error, try again", err });
        }
    });
}
function updateTransaction(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const { id } = req.params;
        const { category, type, amount, description, date, accountId } = req.body;
        console.log(accountId, "accountId");
        try {
            // Fetch transaction and account details
            const transaction = yield Transcation_1.default.findById(id);
            if (!transaction) {
                return res.status(404).json({ message: "Transaction not found" });
            }
            const account = yield Account_1.default.findById(transaction.accountId);
            if (!account) {
                return res.status(404).json({ message: "Account not found" });
            }
            let accBalance = (0, exports.convertToNumber)(account.balance);
            if (accountId) {
                yield Transcation_1.default.findByIdAndUpdate(transaction._id, { accountId: accountId }, // Set new accountId here
                { new: true } // Returns the updated document
                );
            }
            // Reverse the previous transaction's effect on balance
            accBalance = updateAccountBalanceOnReverse(transaction, accBalance);
            // Handle category change if applicable
            if (category) {
                const categoryId = yield Category_1.default.findOne({ name: category, userId: null });
                if (categoryId && categoryId._id.toString() !== ((_a = transaction.category) === null || _a === void 0 ? void 0 : _a.toString())) {
                    console.log(categoryId._id.toString(), (_b = transaction.category) === null || _b === void 0 ? void 0 : _b.toString(), 'boths');
                    yield handleCategoryChange(transaction, categoryId, amount);
                    yield Transcation_1.default.findByIdAndUpdate({
                        _id: transaction._id
                    }, { $set: {
                            category: categoryId._id
                        } }, { upsert: true, new: false });
                }
            }
            // Handle description update
            if (description !== undefined)
                transaction.description = description;
            // Handle type update
            if (type)
                transaction.type = type;
            // Handle date update
            if (date) {
                const parsedDate = new Date(date);
                if (isNaN(parsedDate.getTime())) {
                    return res.status(400).json({ message: "Invalid date format" });
                }
                transaction.date = parsedDate;
                transaction.month = parsedDate.getMonth() + 1;
                transaction.year = parsedDate.getFullYear();
            }
            // Handle amount change if applicable
            if (amount) {
                const numAmount = (0, exports.convertToNumber)(amount);
                if (numAmount >= 1000000000) {
                    return res.status(400).json({ message: "Amount is too large" });
                }
                yield handleAmountChange(transaction, numAmount);
                accBalance = updateAccountBalance(transaction, accBalance, numAmount);
                transaction.amount = numAmount;
            }
            // Update account balance and transaction
            account.balance = accBalance;
            yield account.save();
            yield transaction.save();
            return res.status(200).json({ data: transaction, message: "Successfully updated" });
        }
        catch (err) {
            console.error("Error during transaction update: ", err);
            return res.status(500).json({ message: "An error occurred during the update process", error: err.message });
        }
    });
}
/**
 * Reverse the transaction effect on the account balance.
 */
function updateAccountBalanceOnReverse(transaction, accBalance) {
    if (transaction.type.toLowerCase() === 'income') {
        return accBalance - (0, exports.convertToNumber)(transaction.amount); // Subtract old income
    }
    else if (transaction.type.toLowerCase() === 'expense') {
        return accBalance + (0, exports.convertToNumber)(transaction.amount); // Add back old expense
    }
    return accBalance;
}
/**
 * Update the account balance after applying the new transaction.
 */
function updateAccountBalance(transaction, accBalance, newAmount) {
    if (transaction.type.toLowerCase() === 'income') {
        return accBalance + newAmount;
    }
    else if (transaction.type.toLowerCase() === 'expense') {
        if ((0, exports.convertToNumber)(accBalance) < newAmount) {
            throw new Error("Insufficient funds for this transaction");
        }
        return accBalance - newAmount;
    }
    return accBalance;
}
/**
 * Handle category change, update the old and new budget.
 */
function handleCategoryChange(transaction, newCategoryId, newAmount) {
    return __awaiter(this, void 0, void 0, function* () {
        // Update old budget (subtract the amount)
        console.log(transaction.category, newCategoryId, newAmount, "transaction");
        if (transaction.category) {
            const oldBudget = yield Budgets_1.default.findOne({
                category: transaction.category,
                month: transaction.month,
                year: transaction.year
            });
            if (oldBudget && (oldBudget === null || oldBudget === void 0 ? void 0 : oldBudget.budget)) {
                yield Budgets_1.default.findOneAndUpdate({
                    category: transaction.category,
                    month: transaction.month,
                    year: transaction.year
                }, {
                    $set: {
                        spent: (0, modify_1.toDecimal128)(parseFloat(oldBudget.spent.toString()) - parseFloat(transaction.amount.toString())),
                        remaining: oldBudget.budget !== new mongoose_1.default.Types.Decimal128("0.0") ? (0, modify_1.toDecimal128)(parseFloat(oldBudget.budget.toString()) - (parseFloat(oldBudget.spent.toString()) + parseFloat(transaction.amount.toString()))) : "0.0"
                    }
                }, { new: true, upsert: false });
            }
        }
        // Update new budget (add the amount)
        const newBudget = yield Budgets_1.default.findOne({
            category: newCategoryId._id,
            month: transaction.month,
            year: transaction.year
        });
        if (newBudget && newBudget.budget) {
            // newBudget.spent += convertToNumber(newAmount);
            // let remaining=convertToNumber(newBudget.remaining);
            // remaining = convertToNumber(newBudget.budget) - convertToNumber(newBudget.spent);
            // await newBudget.save();
            console.log(newBudget.budget.toString(), "let me see");
            yield Budgets_1.default.findOneAndUpdate({
                category: newCategoryId._id,
                month: transaction.month,
                year: transaction.year
            }, {
                $set: {
                    spent: (0, modify_1.toDecimal128)(parseFloat(newBudget.spent.toString()) + parseFloat(transaction.amount.toString())),
                    remaining: newBudget.budget !== new mongoose_1.default.Types.Decimal128("0.0") ? (0, modify_1.toDecimal128)(parseFloat(newBudget.budget.toString()) - (parseFloat(newBudget.spent.toString()) + parseFloat(transaction.amount.toString()))) : "0.0"
                }
            }, { new: true, upsert: false });
        }
    });
}
/**
 * Handle amount change, update the related budget.
 */
function handleAmountChange(transaction, newAmount) {
    return __awaiter(this, void 0, void 0, function* () {
        const budget = yield Budgets_1.default.findOne({
            category: transaction.category,
            month: transaction.month,
            year: transaction.year
        });
        if (budget) {
            const amountDifference = newAmount - (0, exports.convertToNumber)(transaction.amount);
            // budget.spent += convertToNumber(amountDifference);
            // let remaining=convertToNumber(budget.remaining)
            // remaining = convertToNumber(budget.budget) - convertToNumber(budget.spent);
            // await budget.save();
            yield Budgets_1.default.findOneAndUpdate({
                category: transaction.category,
                month: transaction.month,
                year: transaction.year
            }, {
                $set: {
                    spent: (0, modify_1.toDecimal128)(parseFloat(budget.spent.toString()) + parseFloat(amountDifference.toString())),
                    remaining: (0, modify_1.toDecimal128)(parseFloat(budget.budget.toString()) - parseFloat(newAmount.toString()))
                }
            }, { new: true, upsert: false });
        }
    });
}
function deleteTranscation(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No IDs provided' });
        }
        try {
            // Fetch transactions to be deleted
            const transactionsToDelete = yield Transcation_1.default.find({ _id: { $in: ids } });
            // Update budgets based on transactions before deleting
            for (const transaction of transactionsToDelete) {
                if (!transaction.amount || !transaction.category) {
                    console.warn(`Transaction with ID ${transaction._id} has missing amount or category. Skipping...`);
                    continue;
                }
                const transactionAmount = (0, exports.convertToNumber)(transaction.amount);
                const findBudget = yield Budgets_1.default.findOne({ category: transaction.category, year: transaction.year, month: transaction.month });
                if (findBudget) {
                    const budgetAmount = (0, exports.convertToNumber)(findBudget.budget);
                    const updatedBudgetAmount = budgetAmount - transactionAmount;
                    yield Budgets_1.default.findByIdAndUpdate(findBudget._id, {
                        $set: {
                            // Update the budget field
                            spent: (0, exports.convertToNumber)(findBudget.spent) - transactionAmount < 0 ? new mongoose_1.default.Types.Decimal128("0.0") : (0, exports.convertToNumber)(findBudget.spent) - transactionAmount, // Adjust spent field
                            remaining: (0, exports.convertToNumber)(findBudget.remaining) < 0 ? new mongoose_1.default.Types.Decimal128("0.0") : updatedBudgetAmount - (0, exports.convertToNumber)(findBudget.spent)
                        }
                    }, { new: true });
                }
            }
            // Now delete transactions
            const cancelItem = yield Transcation_1.default.deleteMany({ _id: { $in: ids } });
            if (cancelItem.deletedCount === 0) {
                return res.status(404).json({ message: 'No transactions found with the provided IDs' });
            }
            return res.status(200).json({ message: 'Transactions deleted and budgets updated successfully' });
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Something happened, please check your connection' });
        }
    });
}
function getLatestTransactions(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const transactions = yield Transcation_1.default.aggregate([
                { $match: { userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id } }, // Filter by user ID if needed
                { $sort: { date: -1 } }, // Sort by date in descending order
                { $limit: 3 }, // Limit to the latest 3 transactions
                {
                    $lookup: {
                        from: "categories", // Collection to join with (replace with your collection name)
                        localField: "category", // Field in the transaction collection
                        foreignField: "_id", // Field in the categories collection
                        as: "category" // Output array field
                    }
                },
                // { $unwind: "$categoryDetails" }        // Optional: if you expect a single category, not an array
            ]);
            if (!transactions.length) {
                return res.status(404).json({ message: "No transactions found." });
            }
            return res.status(200).json({ transactions, message: "Successfully retrieved latest transactions." });
        }
        catch (err) {
            return res.status(500).json({ message: "Error reaching the server", err });
        }
    });
}
function getTranscations(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { category, type, amount, startDate, endDate, pageLimit, page, name, description, search } = req.query;
        const { year, month } = req.params;
        const timeZone = 'Africa/Lagos';
        try {
            const userId = req.user;
            if (!userId) {
                return res.json({ message: "cant proceed you need to be authenticated pls login again" }).status(400);
            }
            console.log(userId, 'ssssssssssss');
            let query = { userId: userId._id };
            // Dynamically add properties to the query object based on the presence of query parameters
            if (search) {
                const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
                query.$or = [
                    { name: searchRegex },
                    { description: searchRegex },
                    { 'category.name': searchRegex }
                ];
            }
            if (category && !search) {
                const categoryDoc = yield Category_1.default.findOne({ name: category });
                if (categoryDoc) {
                    query.category = categoryDoc._id;
                }
            }
            if (name) {
                query.name = name;
            }
            if (description && !search) {
                query.description = new RegExp(description, 'i');
            }
            if (type) {
                query.type = type;
            }
            if (amount) {
                const amountNumber = parseFloat(amount);
                if (!isNaN(amountNumber)) {
                    query.amount = amountNumber;
                } // Consider using a number conversion here if amount should be numeric
            }
            if (startDate && endDate) {
                query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
            }
            else if (startDate) {
                query.createdAt = { $gte: new Date(startDate) };
            }
            else if (endDate) {
                query.createdAt = { $lte: new Date(endDate) };
            }
            // const start = new Date(Date.UTC(year, month - 1, 1)); // Start of the specified month in UTC
            // const end = new Date(Date.UTC(year, month, 1),-1); 
            const startOfMonthLocal = new Date(year, month - 1, 1);
            const startOfMonthUtc = (0, date_fns_tz_1.toZonedTime)(startOfMonthLocal, timeZone);
            // End of the month in the local "Africa/Lagos" timezone
            const endOfMonthLocal = new Date(year, month, 0, 23, 59, 59, 999);
            const endOfMonthUtc = (0, date_fns_tz_1.toZonedTime)(endOfMonthLocal, timeZone);
            // console.log(start)
            // console.log(start.toISOString(),end.toISOString())
            query.date = { $gte: startOfMonthUtc, $lte: endOfMonthUtc };
            const pageNumber = parseInt(page) || 5; // Default to page 1
            const limitNumber = parseInt(pageLimit) || 25;
            const skip = (pageNumber - 1) * limitNumber;
            const listTransactions = yield (Transcation_1.default === null || Transcation_1.default === void 0 ? void 0 : Transcation_1.default.find(query).populate({ path: 'category', select: 'name type' }).populate({ path: 'accountId', select: 'name _id type ' }).skip(skip).limit(limitNumber).sort({ date: -1 }));
            const totalItems = yield Transcation_1.default.countDocuments(query);
            const totalPages = Math.ceil(totalItems / limitNumber);
            return res.status(200).json({
                listTransactions,
                pagination: {
                    totalItems,
                    totalPages,
                    currentPage: pageNumber,
                    pageLimit: limitNumber
                },
                message: "List of transactions successfully retrieved"
            });
        }
        catch (err) {
            return res.send('an error happened in getting the list of transcation').status(500);
        }
    });
}
function metrics(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.user;
            const cashAccount = yield Account_1.default.findOne({ name: "Cash Transaction", type: 'def_coin', isSystemAccount: true, userId: null });
            if (!cashAccount) {
                return res.status(403).json({ message: "Cash Transaction needs to be present" });
            }
            const balanceAggregation = Account_1.default.aggregate([
                { $match: { userId: userId._id, _id: { $ne: cashAccount._id } }, },
                { $group: { _id: null, totalBalance: { $sum: "$balance" } } }
            ]);
            const currentDate = new Date();
            const currentMonth = currentDate.getUTCMonth();
            const currentYear = currentDate.getUTCFullYear();
            console.log(currentYear, currentMonth);
            const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1)); // Start of the month (e.g., June 1, 2024)
            const startOfNextMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 1)); // Start of the next month (e.g., July 1, 2024)
            const incomeAggregation = Transcation_1.default.aggregate([
                {
                    $match: {
                        type: 'income',
                        date: { $gte: startOfMonth, $lt: startOfNextMonth },
                        userId: userId._id,
                        // accountId: { $ne: cashAccount._id } // Exclude Cash Transaction
                    }
                },
                { $group: { _id: null, totalIncome: { $sum: '$amount' } } }
            ]);
            // Aggregate expenses, excluding transactions with account "Cash Transaction" and type "def_coin"
            const expenseAggregation = Transcation_1.default.aggregate([
                {
                    $match: {
                        type: 'expense',
                        date: { $gte: startOfMonth, $lt: startOfNextMonth },
                        userId: userId._id,
                        // accountId: { $ne: cashAccount._id } // Exclude Cash Transaction
                    }
                },
                { $group: { _id: null, totalExpense: { $sum: '$amount' } } }
            ]);
            const budgetAggregation = Budgets_1.default.aggregate([
                { $match: { createdAt: { $gte: startOfMonth, $lt: startOfNextMonth }, userId: userId._id } },
                { $group: { _id: null, totalBudget: { $sum: '$budget' } } },
            ]);
            const convertToNumber = (value) => {
                if (value && typeof value.toString === 'function') {
                    return parseFloat(value.toString());
                }
                return value;
            };
            const [balance, income, expense, budget] = yield Promise.all([balanceAggregation, incomeAggregation, expenseAggregation, budgetAggregation]);
            const totalBalance = balance.length > 0 ? convertToNumber(balance[0].totalBalance) : 0;
            const totalIncome = income.length > 0 ? convertToNumber(income[0].totalIncome) : 0;
            const totalExpense = expense.length > 0 ? convertToNumber(expense[0].totalExpense) : 0;
            const totalBudget = budget.length > 0 ? convertToNumber(budget[0].totalBudget) : 0;
            return res.json({
                totalBalance: totalBalance,
                totalIncome: totalIncome,
                totalExpense: totalExpense,
                totalBudget: totalBudget,
                message: "Monthly totals retrieved successfully"
            });
        }
        catch (err) {
            console.error('Error calculating monthly totals:', err);
            res.status(500).json({ message: "Internal server error" });
        }
    });
}
//utils for transcations
function deductBalance(accountId, currentBalance, amount, type) {
    return __awaiter(this, void 0, void 0, function* () {
        // Fetch the account by ID
        const account = yield Account_1.default.findById(accountId);
        // Check if the account exists
        if (!account) {
            throw new Error('Account not found.');
        }
        // Check if it is a Cash Transaction account of type def_coin
        const isCashTransaction = account.name === 'Cash Transaction' && account.type === 'def_coin' && account.isSystemAccount === true;
        if (type.toLowerCase() === 'expense') {
            if (isCashTransaction) {
                // Handle expense for cash transaction without deducting from a balance
                // Deduct from balance for non-cash transactions
                const balance = 1000000000000;
                console.log('Processing cash expense. No balance deduction needed.');
                yield Account_1.default.findByIdAndUpdate(accountId, {
                    $set: { balance: balance }, new: true
                });
                account.balance = mongoose_1.default.Types.Decimal128.fromString(balance.toFixed(2));
                // You may want to log the transaction or do some other processing
            }
            else {
                // const currentBalance = convertToNumber(account.balance) - parseFloat(amount.toString());
                // Deduct from balance for non-cash transactions
                const balance = parseFloat(currentBalance);
                yield Account_1.default.findByIdAndUpdate(accountId, {
                    $set: { balance: balance - amount }, new: true
                });
                account.balance = mongoose_1.default.Types.Decimal128.fromString(balance.toString());
                yield account.save();
            }
        }
        if (type.toLowerCase() === 'income') {
            // const currentBalance = convertToNumber(account.balance) + parseFloat(amount.toString());
            // Update balance for income
            if (isCashTransaction) {
                // Handle expense for cash transaction without deducting from a balance
                // Deduct from balance for non-cash transactions
                const balance = 1000000000000;
                console.log('Processing cash expense. No balance deduction needed.');
                yield Account_1.default.findByIdAndUpdate(accountId, {
                    $set: { balance: balance }, new: true
                });
                account.balance = mongoose_1.default.Types.Decimal128.fromString(balance.toFixed(2));
                // You may want to log the transaction or do some other processing
            }
            else {
                const balance = parseFloat(currentBalance);
                yield Account_1.default.findByIdAndUpdate(accountId, {
                    $set: { balance: balance + amount }, new: true
                });
                account.balance = mongoose_1.default.Types.Decimal128.fromString(balance.toString());
                yield account.save();
            }
        }
    });
}
function csvExportTransaction(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { year, month } = req.body;
        if (!year || !month) {
            return res.status(400).json({ message: 'Year and month are required.' });
        }
        try {
            // Fetch transactions based on the year, month, and userId
            const data = yield Transcation_1.default.find({
                year: parseInt(year, 10),
                month: parseInt(month, 10),
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            }).populate('category', 'name _id');
            if (!data.length) {
                return res.status(404).json({ message: 'No transactions found for the specified criteria.' });
            }
            console.log(data, 'sd');
            const covertAllAmount = () => {
                const dataall = data.map((item) => ({ _id: item._id, date: item.date, category: item.category, description: item.description, amount: (0, exports.convertToNumber)(item.amount) }));
                return dataall;
            };
            const converted = covertAllAmount();
            // Convert the data to CSV format
            const fields = ['_id', 'amount', 'date', 'name', 'description']; // Adjust fields as per your schema
            const parser = (0, json_2_csv_1.json2csv)(converted, { keys: ['category', '_id', 'amount', 'date', 'description'] });
            const csv = parser;
            // Set headers and send the CSV
            res.header('Content-Type', 'text/csv');
            res.attachment(`transaction_data_${year}_${month}.csv`);
            res.send(csv);
        }
        catch (err) {
            console.error('Error exporting transactions:', err);
            return res.status(500).json({ message: 'Internal server error', error: err });
        }
    });
}
