// registering a user or sign in or signup a user;
import { Response,Request, NextFunction } from "express";
import user, { IUser } from "../models/User";
import jwt from "jsonwebtoken";
import { CreateTransactionRequest } from "./transcation";
import transcation from "../models/Transcation";
import mongoose, { isValidObjectId } from "mongoose";


export async function register(req:Request,res:Response,next:NextFunction):Promise<unknown>{
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
            secure:process.env.NODE_ENV! === "development",
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

        if(!existingUser) return res.status(400).json({ msg: 'Invalid credentials' });
        const isMatch = await existingUser.comparePassword(password)
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
        const payload = { id: existingUser._id ,email:existingUser.email};
        const access_token=jwt.sign(payload,process.env.SECRET_KEY!,{expiresIn:5})
        const refresh_token=jwt.sign(payload, process.env.SECRET_KEY!,{expiresIn:'7d'});
        const expiresIn=Math.floor(Date.now() / 1000 ) * 60 * 60    
        existingUser.userRefreshTokens.push(refresh_token);
        await existingUser.save();
         res.cookie('refreshToken',refresh_token,{
            httpOnly:true,
            secure:false,
            sameSite:'strict',
            path:'/',
            domain:"localhost"
         }) 
       return res.json({access_token,expiresIn}).status(200);
       
     }catch(err){
      return res.send(err).status(500);
    }
 
}


export async function refreshToken(req:Request,res:Response){
    console.log(req.headers.cookie,"cookies")
    console.log(req.cookies.refreshToken,"refresh")
    const  refreshToken = req.cookies['refreshToken'];
    console.log('Received refreshToken:', refreshToken);
    console.log('Secret Key:', process.env.SECRET_KEY!);
     console.log(process.env.SECRET_KEY!,"seddddfff")
  
    try {
        console.log(refreshToken)
        if (!refreshToken) {
            return res.status(401).json({message:'Refresh Token Required'});
          } 
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY!) as {id:string,email:string};

    
      console.log(decoded,"decoded")
      console.log(decoded.id)
      const users = await user.findById(decoded.id);
      console.log(users)
  
      if (!users ) {
           return res.status(403).json({message:'Invalid Refresh Token'});
      }

    
  
      // remove-old userRefreshtoken;

      const tokenIndex=users.userRefreshTokens.findIndex((token)=>token === refreshToken);
      console.log(tokenIndex,'tokenIndexxxxxxxxxxxxxxx')

      if (tokenIndex === -1) {
        return res.status(403).json({ message: 'Invalid Refresh Token' });
    }

    // Remove the old refresh token from the user's array
    users.userRefreshTokens.splice(tokenIndex, 1);
    await users.save();

      // Generate a new access token
      const access_token = jwt.sign(
        { id: users._id, email: users.email },
        process.env.SECRET_KEY!,
        { expiresIn: '1h' }
      );

      const refresh_token = jwt.sign(
        { id: users._id, email: users.email },
        process.env.SECRET_KEY!,
        { expiresIn: '7h' }
      );


     
     console.log(access_token,"Acesssssstoken second")
      users.userRefreshTokens.push(refresh_token);
      await users.save();

      res.cookie('refreshToken',refresh_token,{
        httpOnly:true,
        secure:false,
        sameSite:'strict',
        path:'/',
        domain:"localhost"
     }) 
  
     return  res.status(200).json({ access_token});
    } catch (err:any) {
        if (err.name === 'TokenExpiredError') {
            // Handle expired refresh token
            res.clearCookie('refreshToken');
            return res.status(401).json({ message: 'Session expired, please log in again' });
        }
      return res.status(403).json({message:err})
    }
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
        currentUser.userRefreshTokens.splice(tokenIndex,1);
        // currentUser.userRefreshTokens=[];
       
        await currentUser.save();
        // Clear the refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: false, // Use secure cookies in production
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

interface IncomeByExpense{
    year:number;

}

export async function getTotalIncomeAndExpense(req: Request<{}, {}, {}, IncomeByExpense>, res: Response) {
    const { year} = req.query;

    // Ensure the year is a number and valid
    if (!year || isNaN(year) || year < 1000 || year > 9999) {
        return res.status(400).json({ message: "Invalid year provided. Please provide a valid year." });
    }

    try {
        const userId: any = req.user; // Assuming req.user contains the authenticated user's ID
        if (!userId) {
            return res.status(401).json({ message: "You need to be authenticated. Please log in again." });
        }

        console.log(`Fetching totals for user: ${userId._id}, year: ${year}`);

        // Construct the date range for the specified year
        const startOfYear = new Date(Date.UTC(year, 0, 1)); // UTC date for January 1st of the given year
        const endOfYear = new Date(Date.UTC(year + 1, 0, 1)); // UTC date for January 1st of the following year
        console.log(startOfYear, endOfYear);

        // Aggregate income by month
        const incomeAggregation = transcation.aggregate([
            { $match: { type: 'income', date: { $gte: startOfYear, $lt: endOfYear }, userId: userId._id } },
            { $project: { month: { $month: '$date' }, amount: 1 } },
            { $group: { _id: '$month', totalIncome: { $sum: '$amount' } } },
            { $sort: { _id: 1 } } // Sort by month
        ]);

        // Aggregate expense by month
        const expenseAggregation = transcation.aggregate([
            { $match: { type: 'expense', date: { $gte: startOfYear, $lt: endOfYear }, userId: userId._id } },
            { $project: { month: { $month: '$date' }, amount: 1 } },
            { $group: { _id: '$month', totalExpense: { $sum: '$amount' } } },
            { $sort: { _id: 1 } } // Sort by month
        ]);

        // Wait for both aggregations to complete
        const [incomeResult, expenseResult] = await Promise.all([incomeAggregation, expenseAggregation]);

        console.log('Income aggregation result:', incomeResult);
        console.log('Expense aggregation result:', expenseResult);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const combinedResults = monthNames.map((month, index) => ({
            name: month,
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
            const monthIndex = item._id - 1;
            combinedResults[monthIndex].income = convertToNumber(item.totalIncome);
        });

        expenseResult.forEach(item => {
            const monthIndex = item._id - 1;
            combinedResults[monthIndex].expense = convertToNumber(item.totalExpense);
        });
       // Send the results as a JSON response
        return res.json({ data: combinedResults, message: "Stats retrieved successfully" });
    } catch (err) {
        console.error('Error calculating income and expense:', err);
        res.status(500).json({ message: "Internal server error" });
    }
}