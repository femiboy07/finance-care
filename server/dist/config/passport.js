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
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const options = {
    passReqToCallback: true,
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_KEY,
    // issuer:"finance@qc.com",
};
passport_1.default.use(new passport_jwt_1.Strategy(options, function (req, payload, done) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(payload.id, "payload");
        try {
            const currentUser = yield User_1.default.findOne({ _id: payload.id });
            if (!currentUser) {
                return done(null, false);
            }
            req.user = currentUser;
            console.log(req.user, "passport authenticate");
            // req.user.id=payload.id;
            return done(null, currentUser);
        }
        catch (err) {
            console.log("Error in authentication:", err);
            return done(err, false);
        }
    });
}));
exports.default = passport_1.default;
