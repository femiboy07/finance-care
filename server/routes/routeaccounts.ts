import express from 'express';
import passport from '../config/passport';
import { createAccount, deleteAccount, getAccounts, updateAccount } from '../controllers/accounts';


const router=express.Router();



router.post('/create',passport.authenticate("jwt",{session:false}),createAccount);
router.delete('/delete/:id',passport.authenticate("jwt",{session:false}),deleteAccount);
router.get('/get',passport.authenticate("jwt",{session:false}),getAccounts);
router.put('/update/:id',passport.authenticate("jwt",{session:false}),updateAccount)



export default router;