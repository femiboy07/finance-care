"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("../config/passport"));
const category_1 = require("../controllers/category");
const router = express_1.default.Router();
// router.post('/create',passport.authenticate("jwt",{session:false}),createBudgets);
router.get('/get', passport_1.default.authenticate("jwt", { session: false }), category_1.fetchCategories);
exports.default = router;
