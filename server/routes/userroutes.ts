import express, { NextFunction, Request, Response } from "express";
import { getUserName, logOutUser, refreshToken, register, signInUser } from "../controllers/user";
import { redirectIfAuthenticated,verifyToken } from "../middlewares/redirectIfAuthenticated";
import oauth2Client from "../middlewares/googleauthClient";
import user from "../models/User";
import jwt, { JwtPayload } from 'jsonwebtoken';
import  passport from "../config/passport";
// import { verifyToken } from "../middlewares/redirectIfAuthenticated";

const router=express.Router(); // instance of a mini app router



declare module 'jsonwebtoken' {
    export interface JwtPayload {
      id?: string; // Adding a custom property to JwtPayload
    }
  }




router.get('/register',redirectIfAuthenticated);
router.post('/register',register);
router.get('/logIn',redirectIfAuthenticated);
router.post('/logIn',signInUser);
router.post('/refreshtoken',refreshToken);
router.post('/logout',logOutUser);
router.get('/validate', verifyToken, (req, res) => {
  return res.json({ valid: true, access_token: req.user?.token});
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