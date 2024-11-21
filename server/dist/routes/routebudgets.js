"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("../config/passport"));
const budgets_1 = require("../controllers/budgets");
const router = express_1.default.Router();
// router.post('/create',passport.authenticate("jwt",{session:false}),createBudgets);
router.put('/update/:year/:month', passport_1.default.authenticate("jwt", { session: false }), budgets_1.updateBudget);
router.get('/listbudgets/:year/:month', passport_1.default.authenticate("jwt", { session: false }), budgets_1.getBudgets);
router.delete('/delete/:id', passport_1.default.authenticate("jwt", { session: false }), budgets_1.deleteBudget);
router.post('/clearbudget', passport_1.default.authenticate("jwt", { session: false }), budgets_1.clearAllBudgets);
exports.default = router;
