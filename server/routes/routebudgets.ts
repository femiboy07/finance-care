import express from 'express';
import passport from '../config/passport';
import { createBudgets } from '../controllers/budgets';


const router=express.Router();


router.post('/create',passport.authenticate("jwt",{session:false}),createBudgets);



export default router;