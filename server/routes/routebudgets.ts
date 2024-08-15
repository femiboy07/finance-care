import express from 'express';
import passport from '../config/passport';
import { createBudgets, deleteBudget, getBudgets, updateBudget } from '../controllers/budgets';


const router=express.Router();


router.post('/create',passport.authenticate("jwt",{session:false}),createBudgets);
router.put('/update/:id',passport.authenticate("jwt",{session:false}),updateBudget);
router.get('/listbudgets/:year/:month',passport.authenticate("jwt",{session:false}),getBudgets);
router.delete('/delete/:id',passport.authenticate("jwt",{session:false}),deleteBudget);



export default router;