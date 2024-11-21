"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectIfAuthenticated = void 0;
const redirectIfAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.redirect('/register');
    }
    next();
};
exports.redirectIfAuthenticated = redirectIfAuthenticated;
