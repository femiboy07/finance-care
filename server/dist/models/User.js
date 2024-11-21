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
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
var currencyUser;
(function (currencyUser) {
    currencyUser["USD"] = "United States Dollar";
    currencyUser["NGN"] = "Nigerian Naira";
})(currencyUser || (currencyUser = {}));
const userModel = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        validate: {
            validator: function (email) {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                const isValidEmail = emailRegex.test(email);
                return isValidEmail;
            },
            message: function (props) {
                return `${props.path} email address is wrong `;
            },
        },
        required: true,
    },
    accounts: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Accounts",
            default: []
        }],
    passwordHash: {
        type: String,
        required: true
    },
    userRefreshTokens: {
        type: [String],
        default: [],
    },
    tokens: {
        google_access_token: {
            type: String,
            default: null,
        },
        google_refresh_token: {
            type: String,
            default: null,
        }
    },
    name: String,
    profilePictureUrl: {
        type: String,
        default: null
    },
    currency: {
        type: String,
        enum: currencyUser,
        default: currencyUser.USD,
    },
    createdAt: Date,
});
userModel.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('passwordHash')) {
            return next();
        }
        try {
            const salt = yield bcrypt_1.default.genSalt(15);
            const hashedPassword = yield bcrypt_1.default.hash(this.passwordHash, salt);
            // Replace the plain text password with the hashed one
            this.passwordHash = hashedPassword;
            return next();
        }
        catch (error) {
            return next(error);
        }
    });
});
userModel.method('comparePassword', function comparePassword(userPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(userPassword, this.passwordHash);
    });
});
const user = mongoose_1.default.model('User', userModel);
exports.default = user;
