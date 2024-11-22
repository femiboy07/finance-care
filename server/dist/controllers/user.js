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
exports.register = register;
exports.signInUser = signInUser;
exports.refreshToken = refreshToken;
exports.logOutUser = logOutUser;
exports.getUserName = getUserName;
exports.getTotalIncomeAndExpense = getTotalIncomeAndExpense;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Transcation_1 = __importDefault(require("../models/Transcation"));
const date_fns_1 = require("date-fns");
const date_fns_tz_1 = require("date-fns-tz");
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password, name, username } = req.body;
        if (!email && !password && !name && !username) {
            return res.json({ message: "email and password needed to register" }).status(403);
        }
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(403).send("user already exists");
        }
        //create a new user in the database;
        const newUser = yield User_1.default.create({
            username: username,
            name: name,
            email: email,
            passwordHash: password,
        });
        const payload = { id: newUser.id, email };
        const access_token = jsonwebtoken_1.default.sign(payload, process.env.SECRET_KEY, { expiresIn: '4h' });
        const refresh_token = jsonwebtoken_1.default.sign(payload, process.env.SECRET_KEY, { expiresIn: '7d' });
        const expiresIn = Math.floor(Date.now() / 1000) * 60 * 60;
        newUser.userRefreshTokens.push(refresh_token);
        newUser.save();
        res.cookie('refreshToken', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'lax'
        });
        return res.json({ access_token, message: "registerd succesfully" });
    });
}
function signInUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        try {
            if (!email && !password) {
                return res.status(403).json({ message: "Please provide your email and password to login" });
            }
            const existingUser = yield User_1.default.findOne({ email });
            if (!existingUser)
                return res.status(400).json({ message: 'Invalid credentials' });
            const isMatch = yield existingUser.comparePassword(password);
            if (!isMatch)
                return res.status(400).json({ message: 'Invalid credentials' });
            const payload = { id: existingUser._id, email: existingUser.email };
            const access_token = jsonwebtoken_1.default.sign(payload, process.env.SECRET_KEY, { expiresIn: 60 });
            const refresh_token = jsonwebtoken_1.default.sign(payload, process.env.SECRET_KEY, { expiresIn: '7d' });
            const expiresIn = Math.floor(Date.now() / 1000) + 1 * 60 * 60;
            existingUser.userRefreshTokens = [refresh_token];
            yield existingUser.save();
            res.cookie('refreshToken', refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            });
            return res.json({ access_token, expiresIn }).status(200);
        }
        catch (err) {
            return res.status(500).json({ message: "Network Error", err: err });
        }
    });
}
function refreshToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ message: 'Refresh Token Required' });
            }
            let decoded;
            try {
                decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.SECRET_KEY);
            }
            catch (err) {
                console.error('Token verification error:', err.message);
                if (err.name === 'TokenExpiredError') {
                    res.clearCookie('refreshToken');
                    return res.status(401).json({ message: 'Session expired, please log in again' });
                }
                return res.status(403).json({ message: 'Invalid Refresh Token' });
            }
            const userRecord = yield User_1.default.findById(decoded.id);
            if (!userRecord) {
                return res.status(403).json({ message: 'Invalid Refresh Token: User not found' });
            }
            const tokenIndex = userRecord.userRefreshTokens.indexOf(refreshToken);
            if (tokenIndex === -1) {
                return res.status(403).json({ message: 'Invalid Refresh Token: Token not found' });
            }
            userRecord.userRefreshTokens.splice(tokenIndex, 1);
            yield userRecord.save();
            const newAccessToken = generateToken({ id: userRecord._id, email: userRecord.email }, '1h');
            const newRefreshToken = generateToken({ id: userRecord._id, email: userRecord.email }, '7d');
            userRecord.userRefreshTokens.push(newRefreshToken);
            yield userRecord.save();
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                path: '/',
            });
            return res.status(200).json({ access_token: newAccessToken });
        }
        catch (err) {
            console.error('Unexpected error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    });
}
function generateToken(payload, expiry) {
    return jsonwebtoken_1.default.sign(payload, process.env.SECRET_KEY, { expiresIn: expiry });
}
function logOutUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const refreshToken = req.cookies['refreshToken'];
        console.log(refreshToken);
        try {
            if (!refreshToken) {
                return res.status(401).json({ message: 'No refresh token found' });
            }
            // Verify and process the refresh token
            // Use your existing logic to verify and remove the token
            const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.SECRET_KEY);
            if (!decoded.id) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }
            const currentUser = yield User_1.default.findById(decoded.id);
            if (!currentUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            const tokenIndex = currentUser.userRefreshTokens.findIndex(token => token === refreshToken);
            if (tokenIndex === -1) {
                return res.status(403).json({ message: 'Invalid Refresh Token' });
            }
            // Clear all refresh tokens
            currentUser.userRefreshTokens = [];
            // currentUser.userRefreshTokens=[];
            yield currentUser.save();
            // Clear the refresh token cookie
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                sameSite: 'lax',
                path: '/'
            });
            return res.status(200).json({ message: 'Logged out successfully' });
        }
        catch (err) {
            console.error('Error during logout:', err);
            return res.status(500).json({ message: 'An error occurred during logout' });
        }
    });
}
function getUserName(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const users = yield User_1.default.findById(userId);
            const data = users === null || users === void 0 ? void 0 : users.username;
            return res.status(200).json({ data, message: "username gotten succesfully" });
        }
        catch (err) {
            console.log(err);
        }
    });
}
function getTotalIncomeAndExpense(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const { interval } = req.query;
        const timeZone = 'Africa/Lagos';
        if (!['weekly', 'monthly', 'yearly'].includes(interval)) {
            return res.status(400).json({ message: "Invalid interval provided. Please provide 'weekly', 'monthly', or 'yearly'." });
        }
        try {
            const userId = req.user;
            if (!userId) {
                return res.status(401).json({ message: "You need to be authenticated. Please log in again." });
            }
            const now = new Date();
            const zonedNow = (0, date_fns_tz_1.toZonedTime)(now, timeZone);
            let startDate;
            let endDate;
            let groupBy;
            let labels;
            switch (interval) {
                case 'weekly':
                    startDate = (0, date_fns_1.startOfWeek)(zonedNow, { weekStartsOn: 1 });
                    endDate = (0, date_fns_1.endOfWeek)(zonedNow, { weekStartsOn: 1 });
                    groupBy = { $dayOfWeek: '$date' }; // 1=Sun, 2=Mon, ..., 7=Sat
                    labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                    break;
                case 'monthly':
                    startDate = (0, date_fns_1.startOfMonth)(zonedNow);
                    endDate = (0, date_fns_1.endOfMonth)(zonedNow);
                    groupBy = { $dayOfMonth: '$date' }; // Group by day of the month
                    labels = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
                    break;
                case 'yearly':
                    startDate = (0, date_fns_1.startOfYear)(zonedNow);
                    endDate = (0, date_fns_1.endOfYear)(zonedNow);
                    groupBy = { $month: '$date' }; // 1=Jan, 2=Feb, ..., 12=Dec
                    labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    break;
            }
            // Aggregate income by the selected interval
            const incomeAggregation = Transcation_1.default.aggregate([
                { $match: { type: 'income', date: { $gte: startDate, $lt: endDate }, userId: userId._id } },
                { $group: { _id: groupBy, totalIncome: { $sum: '$amount' } } },
                { $sort: { _id: 1 } } // Sort by the grouping
            ]);
            // Aggregate expense by the selected interval
            const expenseAggregation = Transcation_1.default.aggregate([
                { $match: { type: 'expense', date: { $gte: startDate, $lt: endDate }, userId: userId._id } },
                { $group: { _id: groupBy, totalExpense: { $sum: '$amount' } } },
                { $sort: { _id: 1 } } // Sort by the grouping
            ]);
            // Wait for both aggregations to complete
            const [incomeResult, expenseResult] = yield Promise.all([incomeAggregation, expenseAggregation]);
            const combinedResults = labels.map((label, index) => ({
                name: label,
                income: 0,
                expense: 0
            }));
            // Create an object to store combined results
            const convertToNumber = (value) => {
                if (value && typeof value.toString === 'function') {
                    return parseFloat(value.toString());
                }
                return value;
            };
            // Update the combined results with actual data
            incomeResult.forEach(item => {
                const index = item._id - 1;
                combinedResults[index].income = convertToNumber(item.totalIncome);
            });
            expenseResult.forEach(item => {
                const index = item._id - 1;
                combinedResults[index].expense = convertToNumber(item.totalExpense);
            });
            const calculatePercentageChange = (current, previous) => {
                if (previous === 0)
                    return current > 0 ? 100 : 0; // Avoid division by zero
                return ((current - previous) / previous) * 100;
            };
            // Get totals for the previous interval (for comparison)
            const previousStartDate = (0, date_fns_1.startOfWeek)(zonedNow, { weekStartsOn: 1 });
            const previousEndDate = (0, date_fns_1.endOfWeek)(zonedNow, { weekStartsOn: 1 });
            const previousIncome = yield Transcation_1.default.aggregate([
                { $match: { type: 'income', date: { $gte: previousStartDate, $lt: previousEndDate }, userId: userId._id } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]);
            const previousExpense = yield Transcation_1.default.aggregate([
                { $match: { type: 'expense', date: { $gte: previousStartDate, $lt: previousEndDate }, userId: userId._id } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]);
            // Calculate trends
            const totalIncome = incomeResult.reduce((sum, item) => sum + item.totalIncome, 0);
            const totalExpense = expenseResult.reduce((sum, item) => sum + item.totalExpense, 0);
            const incomeTrend = calculatePercentageChange(totalIncome, ((_a = previousIncome[0]) === null || _a === void 0 ? void 0 : _a.total) || 0);
            const expenseTrend = calculatePercentageChange(totalExpense, ((_b = previousExpense[0]) === null || _b === void 0 ? void 0 : _b.total) || 0);
            // Send the results as a JSON response
            return res.json({ data: combinedResults, trends: { incomeTrend, expenseTrend }, message: "Stats retrieved successfully" });
        }
        catch (err) {
            console.error('Error calculating income and expense:', err);
            res.status(500).json({ message: "Internal server error" });
        }
    });
}
