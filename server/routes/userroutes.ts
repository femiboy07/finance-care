import express, { NextFunction, Request, Response } from "express";
import { getUserName, logOutUser, refreshToken, register, signInUser } from "../controllers/user";
import { redirectIfAuthenticated } from "../middlewares/redirectIfAuthenticated";
import oauth2Client from "../middlewares/googleauthClient";
import user from "../models/User";
import jwt, { JwtPayload } from 'jsonwebtoken';
import  passport from "../config/passport";
import { CreateTransactionRequest } from "../controllers/transcation";
import { noCredentialsCors } from "..";

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
router.post('/register',noCredentialsCors,register);
router.get('/logIn',redirectIfAuthenticated);
router.post('/logIn', noCredentialsCors,signInUser);
router.post('/refreshtoken',refreshToken);
router.post('/logout',logOutUser);






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