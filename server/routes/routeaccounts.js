"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("../config/passport"));
const accounts_1 = require("../controllers/accounts");
const router = express_1.default.Router();
router.post('/create', passport_1.default.authenticate("jwt", { session: false }), accounts_1.createAccount);
router.delete('/delete/:id', passport_1.default.authenticate("jwt", { session: false }), accounts_1.deleteAccount);
router.get('/get', passport_1.default.authenticate("jwt", { session: false }), accounts_1.getAccounts);
router.put('/update/:id', passport_1.default.authenticate("jwt", { session: false }), accounts_1.updateAccount);
exports.default = router;
