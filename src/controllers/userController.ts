import { Request, Response, json } from "express";
import asyncHandler from "express-async-handler";
import speakeasy from 'speakeasy'
import bcrypt from 'bcrypt'
import User from "../models/user/userModel";
import sendVerifyMail from "../utils/sendVerifyEmail";
import generateToken from "../utils/generateToken";
import Connections from "../models/connections/connectionModel";


// Register new user

export const userRegisterController = asyncHandler(
  async (req:Request, res:Response) => { 
    // console.log("req body 00", req.body);
    
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
    
    const sessionData = req.session!;
    sessionData.userDetails = {userName, email, password}
    sessionData.otp = otp;
    sessionData.otpGeneratedTime = Date.now()
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    sessionData.userDetails!.password = hashedPassword
    sendVerifyMail(req, userName, email)
    console.log("register session0", sessionData);
    res.status(200).json({ message: "OTP sent for verification ", email });
  }
)

// register otp verification 

export const verifyOTPController = asyncHandler(
  async(req: Request, res: Response) => {
    // console.log("in verify");
    
    const { otp } = req.body;
    if(req.session) {
      console.log("in session")
    }
    // console.log("otp verify session here itself ",req.session);
    console.log("enterd otp", otp);
    
    const sessionData = req.session!;
    console.log("verify session data_3", sessionData);
    
    const storedOTP = sessionData.otp;
    console.log("storedOTP", storedOTP)

    if(!storedOTP || otp !== storedOTP) {
      res.status(400).json({message: "Invalid OTP"})
      return
      // throw new Error("Invalid OTP")
    }
    const otpGeneratedTime = sessionData.otpGeneratedTime || 0
    const currentTime = Date.now()
    const otpExpirationTime = 60 * 1000;
    if(currentTime - otpGeneratedTime > otpExpirationTime) {
      res.status(400).json({message: "User details not found in session"})
      // throw new Error("User details not found in session")
    }
    const userDetails = sessionData.userDetails;
    if(!userDetails) {
      // res.status(400).json({message: "User details not found in session"});
      throw new Error("User details not found in session");
    }
    const user = await User.create({
      userName: userDetails.userName,
      email: userDetails.email,
      password: userDetails.password,
    })
    console.log('zzzzdat1 :', user);
    
    await Connections.create({
      userId: user._id
    })
    delete sessionData.userDetails;
    delete sessionData.otp;
    delete sessionData.otpGeneratedTime;
    console.log("zzzdat2 : ", sessionData);
    
    res.status(200).json({ message: "OTP verified, user created", user });
  }
)


// resend otp

export const resendOTPController = asyncHandler(
  async(req: Request, res: Response) => {
    console.log("inside resend otp");
    const {email} = req.body
    const otp = speakeasy.totp({
      secret: speakeasy.generateSecret({ length: 20 }).base32,
      digits: 4,
    });
    
    const sessionData = req.session!;
    sessionData.otp = otp;
    sessionData.otpGeneratedTime = Date.now()
    const userDetails = sessionData.userDetails;
    console.log("sessiondata resendotp", sessionData);
    if(!userDetails) {
      res.status(400).json({message: "User details not found in session"})
      // throw new Error("User details not found in session")
      return  
    }
    console.log(sessionData);
    sendVerifyMail(req, userDetails.userName, userDetails.email);
    res.status(200).json({ message: "OTP sent for verification", email })
  }
)

// forgot password

export const forgotPasswordController = asyncHandler(
  async(req: Request, res: Response) => {
    const {email} = req.body;
    const user = await User.findOne({email})

    if(user?.isGoogle) {
      res.status(400).json({message: "SignIn with google or Create account"})
      return
    }
    
    if(user) {
      const otp = speakeasy.totp({
        secret: speakeasy.generateSecret({length: 20}).base32,
        digits: 4,
      })
      // console.log("req session",req.session);
      const sessionData = req.session!;
      sessionData.otp = otp
      sessionData.otpGeneratedTime = Date.now()
      sessionData.email = email;
      console.log("sessiondata in forgotPasswordController", sessionData);
      sendVerifyMail(req, user.userName, user.email);
      res.status(200).json({message: `OTP has been send to your email`, email})
    } else {
      res.status(400).json({message: "User not found"})
      // throw new Error("Not User Found");
    }
  }
)

// forgot password otp verification

export const forgotOtpController = asyncHandler(
  async(req:Request, res:Response) => {
    const {otp} = req.body;
    // console.log("otp verification ", otp);
    if(!otp) {
      res.status(400).json({message: "Please provide OTP"})
      return
      // throw new Error("Please provide OTP");
    }
    const sessionData = req.session!;
    const storedOTP = sessionData.otp
    console.log("stored otp",storedOTP);
    if(!storedOTP || otp !== storedOTP) {
      res.status(400).json({message: "Invalid OTP"})
      return
      // throw new Error("Invalid OTP")
    }
    const otpGeneratedTime = sessionData.otpGeneratedTime || 0;
    const currentTime = Date.now();
    const otpExpirationTime = 60 * 1000;
    if (currentTime - otpGeneratedTime > otpExpirationTime) { 
      res.status(400).json({message: "OTP has expired"})
      return
      // throw new Error("OTP has expired");
    }

    delete sessionData.otp
    delete sessionData.otpGeneratedTime
    // console.log("sessiondata in forgotOtpController", sessionData);
    res.status(200).json({message: "OTP has been verified. Please reset password",
    email: sessionData?.email,
    })
  }
)

// reset password

export const resetPasswordController = asyncHandler(
  async(req: Request, res: Response) => {
    const {password, confirmPassword} = req.body  
    const sessionData = req.session
    console.log("sessiondata in resetPasswordController", sessionData);
    if(!sessionData || !sessionData.email) {
      res.status(400).json({message: "No session data found in session"})
      return
    }

    if(password !== confirmPassword) {
      res.status(400).json({message: "Password do not match"})
      return
    }

    const user = await User.findOne({email: sessionData.email})
    if(!user) {
      res.status(400).json({message: "User not found"})
      return
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user?user.password = hashedPassword : null
    await user?.save()
    res.status(200).json({ message: "Password has been reset successfully" });
  }
)

// Login user

export const userLoginController = asyncHandler(
  async (req:Request, res:Response) => {
    const {email, password} = req.body
    console.log("email: ",email, "Password: ", password);

    const user = await User.findOne({email})
    if(user?.isBlocked) {
      res.status(400).json({message: "user is blocked"})
      return
    }
    
    if (user && typeof user.password === 'string' && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({
        message: "Login succussfull",
        _id: user.id,
        userName: user.userName,
        name: user.name,
        bio: user.bio,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        profileImg: user.profileImg,
        savedPost: user.savedPost,
        token: generateToken(user.id)
      })
    } else {
      res.status(400).json({message: "invalid credentails"})
      // throw new Error("Invalid credentails");
    }
  }
)

// Google authentication

export const googleAuthController = asyncHandler(
  async(req: Request, res: Response) => {
    const {userName, email, profileImg} = req.body.userData
    console.log("request body",req.body);
    console.log("user datas ",userName, email, profileImg );
    try {
      const userExist = await User.findOne({email})

      if(userExist) {
        if(userExist.isBlocked) {
          res.status(400).json({message: "User is blocked"})
          return
        }
        if(userExist.isGoogle) {
          res.json({
            message: "Login succussfull",
            _id: userExist.id,
            userName: userExist.userName,
            email: userExist.email,
            name: userExist.name,
            profileImg: userExist.profileImg,
            bio: userExist.bio,
            phone: userExist.phone,
            token: generateToken(userExist.id)
          })
          return
        } else {
          res.status(400).json({message: "User already Exist with this email"})
        }
      }

      const randomPassword = Math.random().toString(36).slice(-8)
      const hashedPassword = await bcrypt.hash(randomPassword, 10)

      const newUser = await User.create({
        userName: userName,
        email: email,
        password: hashedPassword,
        profileImg: profileImg,
        isGoogle: true,
      })
      await Connections.create({
        userId: newUser._id
      }) 

      const newUserId:any = newUser?._id

      const token = generateToken(newUserId)

      res.status(200).json({
        message: "Login succussfull",
        _id: newUser.id,
        userName: newUser.userName,
        email: newUser.email,
        name: newUser.name,
        profileImg: newUser.profileImg,
        bio: newUser.bio,
        phone: newUser.phone,
        token: token,
      })
    } catch (error) {
      console.error("Error in Google authentication:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
)
