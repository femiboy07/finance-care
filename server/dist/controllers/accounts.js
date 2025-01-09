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
exports.createDefaultAccountForUser = void 0;
exports.createAccount = createAccount;
exports.updateAccount = updateAccount;
exports.deleteAccount = deleteAccount;
exports.getAccounts = getAccounts;
const Account_1 = __importDefault(require("../models/Account"));
const Transcation_1 = __importDefault(require("../models/Transcation"));
const Budgets_1 = __importDefault(require("../models/Budgets"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const Category_1 = __importDefault(require("../models/Category"));
const createDefaultAccountForUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if the default account exists for the user
        const defaultAccountExists = yield Account_1.default.findOne({
            name: 'Cash Transaction',
            type: 'def_coin',
            userId: userId, // Check for user-specific default account
        });
        if (!defaultAccountExists) {
            const account = new Account_1.default({
                userId: userId, // Tie account to the specific user
                type: 'def_coin',
                isSystemAccount: true,
                name: 'Cash Transaction',
                balance: 100000000000000,
            });
            yield account.save();
            console.log(`Default account created for user: ${userId}`);
        }
        else {
            console.log(`Default account already exists for user: ${userId}`);
        }
    }
    catch (error) {
        console.error(`Error creating default account for user ${userId}:`, error);
    }
});
exports.createDefaultAccountForUser = createDefaultAccountForUser;
function createAccount(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { name, type, balance } = req.body;
        // Validate required fields
        if (!name || !type || balance === undefined || balance < 0) {
            return res.status(400).json({ message: "Name, type, and a valid positive balance are required to create an account" });
        }
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // Extract user ID from the request
        if (!userId) {
            return res.status(400).json({ message: "User ID is missing from the request." });
        }
        // Start a session for transaction
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // Create the account
            const newAccount = new Account_1.default({
                userId: userId,
                name: name,
                assets: type,
                balance: balance
            });
            // Save the new account within the transaction
            yield newAccount.save({ session });
            // Update user's account list (Assuming 'users' model exists and has accounts array)
            const userAccount = yield User_1.default.findById(userId).session(session);
            console.log(userAccount);
            if (!userAccount) {
                throw new Error("User not found");
            }
            // Add the new account's ID to the user's accounts array
            userAccount.accounts.push(newAccount._id);
            yield newAccount.save({ session });
            yield userAccount.save({ session });
            // Create initial transaction if balance > 0
            if (balance > 0) {
                const addCategory = yield Category_1.default.findOne({ name: "deposit" });
                if (!addCategory) {
                    throw new Error('not found');
                }
                // const initialTransaction =  new transcation({
                //     userId:userId,
                //     accountId: newAccount._id,
                //     category: addCategory._id,
                //     name:userAccount.name,
                //     amount: balance,
                //     status: "cleared",
                //     type: addCategory.type, // Assuming it's an initial deposit
                //     description: 'Initial deposit'
                // });
                // // Save the initial transaction within the transaction
                // (await initialTransaction.save({ session }));
                // // Add the transaction ID to the account's transactions array
                // newAccount.transcations.push(initialTransaction._id);
                yield newAccount.save({ session });
            }
            // Commit the transaction
            yield session.commitTransaction();
            session.endSession();
            // Return success response
            return res.status(200).json({ account: newAccount, message: "Account created successfully" });
        }
        catch (err) {
            // Rollback transaction if there's an error
            yield session.abortTransaction();
            session.endSession();
            // Log the error for debugging
            console.error("Error during account creation:", err);
            // Return error response
            return res.status(500).json({ message: "An error occurred, please check your connection", error: err });
        }
    });
}
function updateAccount(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        const { name, type, balance } = req.body;
        if (Number.isNaN(balance)) {
            return res.status(403).json({ message: 'Pls input a valid number' });
        }
        if (!id) {
            return res.status(400).json({ message: "Account ID is required..." });
        }
        try {
            const account = yield Account_1.default.findById(id);
            if (!account) {
                return res.status(404).json({ message: "Account not found..." });
            }
            // Update the account fields
            if (balance)
                account.balance = balance;
            if (name)
                account.name = name;
            if (type)
                account.type = type;
            yield account.save();
            return res.status(200).json({ data: account, message: "Budget updated successfully..." });
        }
        catch (err) {
            return res.status(500).json({ message: "System error, please try again later", err });
        }
    });
}
function deleteAccount(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Account ID is required" });
        }
        // Start a session for transaction
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // Find and delete the account
            const account = yield Account_1.default.findByIdAndDelete(id).session(session);
            if (!account) {
                yield session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: `Account with ID ${id} not found` });
            }
            // Delete all transactions related to the account
            yield Transcation_1.default.deleteMany({ accountId: id }).session(session);
            const accountUser = yield User_1.default.findOne({ accounts: id }).session(session);
            if (accountUser) {
                accountUser.accounts = accountUser.accounts.filter((accountId) => accountId.toString() !== id);
                yield accountUser.save({ session }); // Save changes within the transaction
            }
            // Delete all budgets related to the account
            yield Budgets_1.default.deleteMany({ accountId: id }).session(session);
            // Commit the transaction
            yield session.commitTransaction();
            session.endSession();
            return res.status(200).json({ message: `Account with ID ${id} and its related records have been deleted` });
        }
        catch (err) {
            // If an error occurs, abort the transaction
            yield session.abortTransaction();
            session.endSession();
            return res.status(500).json({ message: "An error occurred while deleting the account", err });
        }
    });
}
function getAccounts(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.user;
            // Fetch accounts concurrently
            const [allAccount, defaultAccount] = yield Promise.all([
                Account_1.default.find({ userId: userId }),
                Account_1.default.findOne({ userId: null, isSystemAccount: true })
            ]);
            if (!allAccount.length && !defaultAccount) {
                return res.status(403).send("You have no accounts yet, please create one");
            }
            const allAccounts = [...allAccount, defaultAccount].filter(Boolean); // Ensures no null/undefined values in array
            return res.status(200).json({
                allAccounts,
                message: "List of accounts retrieved successfully"
            });
        }
        catch (err) {
            console.error("Error fetching accounts:", err);
            return res.status(500).send("Server error, please check your connection");
        }
    });
}
