import { Request, Response, json } from "express";
import asyncHandler from "express-async-handler";
import speakeasy from 'speakeasy'
import bcrypt from 'bcrypt'
import User from "../models/user/userModel";
import sendVerifyMail from "../utils/sendVerifyEmail";
// import generateToken from "../utils/generateToken";
// import Connections from "../models/connections/connectionModel";


// Register new user

export const userRegisterController = asyncHandler(
  async (req:Request, res:Response) => {
    const {userName, email, password} = req.body
    
    const userEmail = await User.findOne({email})
    if(userEmail) {
      res.status(500).json({message: "Email already exist"})
    }
    const userId = await User.findOne({userName})
    if(userId) {
      res.status(500).json({message: "UserName already exist"})
    }

    const otp = speakeasy.totp({
      secret: speakeasy.generateSecret({ length: 20 }).base32,
      digits: 4,
    })  
    console.log("req session details", req.session);
    const sessionData = req.session!;
    sessionData.userDetails = {userName, email, password}
    sessionData.otp = otp;
    sessionData.otpGeneratedTime = Date.now()
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    sessionData.userDetails!.password = hashedPassword
    sendVerifyMail(req, userName, email)
    console.log("register session", sessionData);
    res.status(200).json({ message: "OTP sent for verification ", email });
  }
)