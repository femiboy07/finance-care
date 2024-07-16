import express, { NextFunction, Request, Response } from "express";
import { getUserName, register, signInUser } from "../controllers/user";
import { redirectIfAuthenticated } from "../middlewares/redirectIfAuthenticated";
import oauth2Client from "../middlewares/googleauthClient";
import user from "../models/User";
import jwt, { JwtPayload } from 'jsonwebtoken';
import  passport from "../config/passport";

const router=express.Router(); // instance of a mini app router



declare module 'jsonwebtoken' {
    export interface JwtPayload {
      id?: string; // Adding a custom property to JwtPayload
    }
  }


export function validateOrigin(req:Request, res:Response, next:NextFunction) {
    const allowedOrigin = 'https://localhost:5000'; // Replace with your app's URL
    const origin = req.get('Origin');
    const referer = req.get('Referer');
  
    if (origin && origin !== allowedOrigin) {
      return res.status(403).send('Invalid origin');
    }
  
    if (referer && !referer.startsWith(allowedOrigin)) {
      return res.status(403).send('Invalid referer');
    }
  
    next();
  }


router.get('/register',redirectIfAuthenticated);
router.post('/register',register);
router.get('/logIn',redirectIfAuthenticated);
router.post('/logIn',signInUser);



router.post('/refreshtoken', async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
  
    if (!refreshToken) {
      return res.status(401).send('Refresh Token Required');
    }
  
    try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY!) as {_id:string,email:string};
      console.log(decoded,"decoded")
      const users = await user.findById(decoded._id);
      console.log(users)
  
      if (!users) {
        return res.status(403).send('Invalid Refresh Token');
      }
  
      // remove-old userRefreshtoken;

      const tokenIndex=users.userRefreshTokens.indexOf(refreshToken);

      if (tokenIndex === -1) {
        return res.status(403).json({ message: 'Invalid Refresh Token' });
    }

    // Remove the old refresh token from the user's array
    users.userRefreshTokens.splice(tokenIndex, 1);

      // Generate a new access token
      const accessToken = jwt.sign(
        { id: users._id, email: users.email },
        process.env.SECRET_KEY!,
        { expiresIn: '1h' }
      );

      const refreshtoken = jwt.sign(
        { id: users._id, email: users.email },
        process.env.SECRET_KEY!,
        { expiresIn: '7h' }
      );

      users.userRefreshTokens.push(refreshtoken);
      await users.save();
  
      res.json({ accessToken ,refreshtoken});
    } catch (err) {
      return res.status(403).send('Invalid Refresh Token');
    }
  }); 


router.get('/google', passport.authenticate('jwt', { session: false }), (req:Request | any, res) => {
    console.log(req.user.id)
    const stateToken = jwt.sign({ id: req.user.id! }, process.env.SECRET_KEY!, { expiresIn: '10m' });
  
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.email'
           ,'https://www.googleapis.com/auth/gmail.readonly'
    ],
      state: stateToken
    });
  
    res.redirect(url);
  });




export default router;