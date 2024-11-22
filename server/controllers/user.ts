// registering a user or sign in or signup a user;
import { Response,Request } from "express";
import user from "../models/User";
import jwt from "jsonwebtoken";
import { CreateTransactionRequest } from "./transcation";
import transcation from "../models/Transcation";
import {startOfWeek,startOfMonth,startOfYear,endOfWeek,endOfMonth,endOfYear} from "date-fns";
import {toZonedTime} from 'date-fns-tz'


export async function register(req:Request,res:Response):Promise<unknown>{
     const {email,password,name,username}=req.body;
     
     if(!email && !password && !name && !username){
      return  res.json({message:"email and password needed to register"}).status(403);
     }

     const existingUser=await user.findOne({email});

     if(existingUser){
        return res.status(403).send("user already exists");
     }

     //create a new user in the database;
     
        const newUser=await user.create({
              username:username,
              name:name,
              email:email,
              passwordHash:password,
              

        }) 
         const payload={id:newUser.id,email}
         const access_token=jwt.sign(payload,process.env.SECRET_KEY!,{expiresIn:'4h'})
         const refresh_token=jwt.sign(payload, process.env.SECRET_KEY!,{expiresIn:'7d'});
         const expiresIn=Math.floor(Date.now() / 1000 ) * 60 * 60  
         newUser.userRefreshTokens.push(refresh_token);

         newUser.save();
         res.cookie('refreshToken',refresh_token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:'strict'
         }) 
        return res.json({access_token,message:"registerd succesfully"});
         
}



export async function signInUser(req:Request,res:Response){
    const {email,password}=req.body;
    try{
        if(!email && !password){
            return res.status(403).json({message:"Please provide your email and password to login"});
        }
        const existingUser=await user.findOne({email});
        if(!existingUser) return res.status(400).json({ message: 'Invalid credentials' });
        const isMatch = await existingUser.comparePassword(password)
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        const payload = { id: existingUser._id ,email:existingUser.email};
        const access_token=jwt.sign(payload,process.env.SECRET_KEY!,{expiresIn:60})
        const refresh_token=jwt.sign(payload, process.env.SECRET_KEY!,{expiresIn:'7d'});
        const expiresIn=Math.floor(Date.now() / 1000 ) + 1 * 60 * 60    
        existingUser.userRefreshTokens = [refresh_token];
        await existingUser.save();
         res.cookie('refreshToken',refresh_token,{
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite:'strict',
            path:'/',
            
         }) 
       return res.json({access_token,expiresIn}).status(200);
       
     }catch(err){
      return res.status(500).json({message:"Network Error",err:err});
    }
 
}
export async function refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken;
  
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh Token Required' });
      }
  
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, process.env.SECRET_KEY!) as { id: string; email: string };
      } catch (err: any) {
        console.error('Token verification error:', err.message);
        if (err.name === 'TokenExpiredError') {
          res.clearCookie('refreshToken');
          return res.status(401).json({ message: 'Session expired, please log in again' });
        }
        return res.status(403).json({ message: 'Invalid Refresh Token' });
      }
  
      const userRecord = await user.findById(decoded.id);
      if (!userRecord) {
        return res.status(403).json({ message: 'Invalid Refresh Token: User not found' });
      }
  
      const tokenIndex = userRecord.userRefreshTokens.indexOf(refreshToken);
      if (tokenIndex === -1) {
        return res.status(403).json({ message: 'Invalid Refresh Token: Token not found' });
      }
  
      userRecord.userRefreshTokens.splice(tokenIndex, 1);
      await userRecord.save();
  
      const newAccessToken = generateToken({ id: userRecord._id, email: userRecord.email }, '1h');
      const newRefreshToken = generateToken({ id: userRecord._id, email: userRecord.email }, '7d');
  
      userRecord.userRefreshTokens.push(newRefreshToken);
      await userRecord.save();
  
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        
      });
  
      return res.status(200).json({ access_token: newAccessToken });
    } catch (err: any) {
      console.error('Unexpected error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  function generateToken(payload: object, expiry: string) {
    return jwt.sign(payload, process.env.SECRET_KEY!, { expiresIn: expiry });
  }


  export async function logOutUser(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    
    console.log(refreshToken);
    

    try {
        if (!refreshToken) {
            return res.status(401).json({ message: 'No refresh token found' });
        }

        // Verify and process the refresh token
        // Use your existing logic to verify and remove the token
        const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY!) as { id: string,email:string};
        if (!decoded.id) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const currentUser = await user.findById(decoded.id);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        const tokenIndex = currentUser.userRefreshTokens.findIndex(token => token === refreshToken);

        if (tokenIndex === -1) {
            return res.status(403).json({ message: 'Invalid Refresh Token' });
        }
        // Clear all refresh tokens
        currentUser.userRefreshTokens = []
        // currentUser.userRefreshTokens=[];
       
        await currentUser.save();
        // Clear the refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict',
            path: '/'
        });

       

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Error during logout:', err);
        return res.status(500).json({ message: 'An error occurred during logout' });
    }
}
export async function getUserName(req:CreateTransactionRequest,res:Response){

  try{
      const userId=req.user?._id;
      const users=await user.findById(userId);
      const data=users?.username;
      return res.status(200).json({data,message:"username gotten succesfully"});
  }catch(err){
     console.log(err);
  }
}
interface IncomeByExpenseQuery {
    interval: 'weekly' | 'monthly' | 'yearly';
}

export async function getTotalIncomeAndExpense(req: Request<{}, {}, {}, IncomeByExpenseQuery>, res: Response) {
    const { interval } = req.query;
    const timeZone='Africa/Lagos';

    if (!['weekly', 'monthly', 'yearly'].includes(interval)) {
        return res.status(400).json({ message: "Invalid interval provided. Please provide 'weekly', 'monthly', or 'yearly'." });
    }

    try {
        const userId: any = req.user;
        if (!userId) {
            return res.status(401).json({ message: "You need to be authenticated. Please log in again." });
        }
        

        const now = new Date();
        const zonedNow=toZonedTime(now,timeZone)
        let startDate: Date;
        let endDate: Date;
        let groupBy: any;
        let labels: string[];
      
        switch (interval) {
            case 'weekly':
                startDate =  startOfWeek(zonedNow,{weekStartsOn:1});
                endDate = endOfWeek(zonedNow,{weekStartsOn:1});
                groupBy = { $dayOfWeek: '$date' }; // 1=Sun, 2=Mon, ..., 7=Sat
                labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat","Sun"];
                break;
            case 'monthly':
                startDate = startOfMonth(zonedNow);
                endDate = endOfMonth(zonedNow);
                groupBy = { $dayOfMonth: '$date' }; // Group by day of the month
                labels = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
                break;
            case 'yearly':
                startDate = startOfYear(zonedNow);
                endDate = endOfYear(zonedNow);
                groupBy = { $month: '$date' }; // 1=Jan, 2=Feb, ..., 12=Dec
                labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                break;
        }

        // Aggregate income by the selected interval
        const incomeAggregation = transcation.aggregate([
            { $match: { type: 'income', date:{ $gte: startDate, $lt: endDate }, userId: userId._id } },
            { $group: { _id: groupBy, totalIncome: { $sum: '$amount' } } },
            { $sort: { _id: 1 } } // Sort by the grouping
        ]);

        // Aggregate expense by the selected interval
        const expenseAggregation = transcation.aggregate([
            { $match: { type: 'expense', date: { $gte: startDate, $lt: endDate }, userId: userId._id } },
            { $group: { _id: groupBy, totalExpense: { $sum: '$amount' } } },
            { $sort: { _id: 1 } } // Sort by the grouping
        ]);

        // Wait for both aggregations to complete
        const [incomeResult, expenseResult] = await Promise.all([incomeAggregation, expenseAggregation]);

        const combinedResults = labels.map((label, index) => ({
            name: label,
            income: 0,
            expense: 0
        }));

        // Create an object to store combined results
        const convertToNumber = (value: any) => {
            if (value && typeof value.toString === 'function') {
                return parseFloat(value.toString());
            }
            return value;
        };


        // Update the combined results with actual data
        incomeResult.forEach(item => {
            const index = item._id - 1;
            combinedResults[index].income = convertToNumber(item.totalIncome);
        });

        expenseResult.forEach(item => {
            const index = item._id - 1;
            combinedResults[index].expense = convertToNumber(item.totalExpense);
        });

        const calculatePercentageChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0; // Avoid division by zero
            return ((current - previous) / previous) * 100;
        };
        
        // Get totals for the previous interval (for comparison)
        const previousStartDate = startOfWeek(zonedNow, { weekStartsOn: 1 });
        const previousEndDate = endOfWeek(zonedNow,{weekStartsOn:1})
        
        const previousIncome = await transcation.aggregate([
            { $match: { type: 'income', date: { $gte: previousStartDate, $lt: previousEndDate }, userId: userId._id } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        
        const previousExpense = await transcation.aggregate([
            { $match: { type: 'expense', date: { $gte: previousStartDate, $lt: previousEndDate }, userId: userId._id } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        
        // Calculate trends
        const totalIncome = incomeResult.reduce((sum, item) => sum + item.totalIncome, 0);
        const totalExpense = expenseResult.reduce((sum, item) => sum + item.totalExpense, 0);
        
        const incomeTrend = calculatePercentageChange(totalIncome, previousIncome[0]?.total || 0);
        const expenseTrend = calculatePercentageChange(totalExpense, previousExpense[0]?.total || 0);
        

        // Send the results as a JSON response
        return res.json({ data: combinedResults,trends:{incomeTrend,expenseTrend}, message: "Stats retrieved successfully" });
    } catch (err) {
        console.error('Error calculating income and expense:', err);
        res.status(500).json({ message: "Internal server error" });
    }
}