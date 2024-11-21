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
exports.seedDefaultAccount = void 0;
exports.clearAccounts = clearAccounts;
const User_1 = __importDefault(require("../models/User")); // Ensure the User model is imported
const Category_1 = __importDefault(require("../models/Category")); // Ensure the Category model is imported
const Account_1 = __importDefault(require("../models/Account"));
const seedDefaultAccount = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const defaultAccountExists = yield Account_1.default.findOne({ name: 'Cash Transaction', type: 'def_coin', userId: null });
        const users = yield User_1.default.find({}); // Get all users
        const categories = yield Category_1.default.find({}); // Get all categories
        for (const user of users) {
            if (!defaultAccountExists) {
                const account = yield Account_1.default.create({
                    userId: null,
                    type: 'def_coin',
                    isSystemAccount: true,
                    name: 'Cash Transaction',
                    balance: 0
                });
                yield account.save();
            }
            else {
                console.log('default account already exists!...');
            }
        }
        console.log("Budget seeding complete.");
    }
    catch (error) {
        console.error("Error seeding budgets:", error);
    }
});
exports.seedDefaultAccount = seedDefaultAccount;
function clearAccounts() {
    return __awaiter(this, void 0, void 0, function* () {
        yield Account_1.default.deleteMany(); // Optionally clear global categories
    });
}
