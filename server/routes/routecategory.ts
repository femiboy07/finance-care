import express from 'express';
import passport from '../config/passport';
import { deleteBudget, getBudgets, updateBudget,} from '../controllers/budgets';
import { fetchCategories } from '../controllers/category';


const router=express.Router();


// router.post('/create',passport.authenticate("jwt",{session:false}),createBudgets);

router.get('/get',passport.authenticate("jwt",{session:false}),fetchCategories);




export default router;