"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTokensMiddleware = exports.redirectIfAuthenticated = void 0;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redirectIfAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.redirect('/register');
    }
    next();
};
exports.redirectIfAuthenticated = redirectIfAuthenticated;
const validateTokensMiddleware = (req, res, next) => {
    var _a;
    const accessToken = (_a = req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    const refreshToken = req.cookies["refreshToken"];
    if (!accessToken) {
        return res.status(401).json({ message: "Access Token Required" });
    }
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh Token Required" });
    }
    // Proceed to the next middleware (e.g., Passport authentication)
    next();
};
exports.validateTokensMiddleware = validateTokensMiddleware;
function verifyToken(req, res, next) {
    var _a;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1]; // Extract Bearer token
    if (!token) {
        return res.status(401).json({ message: 'Token is required' });
    }
    try {
        jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY); // Verify token
        req.user = {
            token: token,
        };
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        }
        return res.status(403).json({ message: 'Invalid token' });
    }
}
