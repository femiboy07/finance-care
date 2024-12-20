import express from 'express';
import passport from '../config/passport';
import { createTranscation, csvExportTransaction, deleteTranscation, getLatestTransactions, getTranscations, metrics, updateTransaction } from '../controllers/transcation';
import { getTotalIncomeAndExpense, getUserName } from '../controllers/user';


const router=express.Router();




router.post('/create',passport.authenticate("jwt",{session:false}),createTranscation);
router.get('/listtransactions/:year/:month',passport.authenticate("jwt",{session:false}),getTranscations);
router.get('/latesttransaction',passport.authenticate("jwt",{session:false}),getLatestTransactions);
router.put('/update/:id',passport.authenticate("jwt",{session:false}),updateTransaction);
router.post('/delete',passport.authenticate("jwt",{session:false}),deleteTranscation);
router.get('/statistics',passport.authenticate("jwt",{session:false}),getTotalIncomeAndExpense);
router.get('/metrics',passport.authenticate("jwt",{session:false}),metrics);
router.get('/getusername',passport.authenticate("jwt",{session:false}),getUserName);
router.post('/csvexport',passport.authenticate("jwt",{session:false}),csvExportTransaction);





export default router;

