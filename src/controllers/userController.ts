// import { Request, Response } from 'express';
// import { StatusCodes } from "http-status-codes";
// import asyncHandler from "express-async-handler";
import speakeasy from "speakeasy";
import bcrypt from "bcrypt";
import User from "../models/user/userModel";
// import sendVerifyMail from "../utils/sendVerifyEmail";
import generateToken from "../utils/generateToken";
import generateRefreshToken from "../utils/generateRefreshToken";
import Connections from "../models/connections/connectionModel";
import RefreshToken from "../models/token/tokenModel";
// import { findUserByEmail, findUserByUsername, createUser, createConnection } from '../respository/UserRepository';
// import { UserService } from '../services/userServices';

// method 3 with class base  repository

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import { UserService } from "../services/userServices";
import { UserRepository } from "../respository/UserRepository";
import sendVerifyMail from "../utils/sendVerifyEmail";
import jwt from "jsonwebtoken";

// export const userRegisterController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const userRepository = new UserRepository();
//     const userService = new UserService(userRepository);

//     try {
//       const { otp, sessionData } = await userService.registerUser(req.body);

//       // Update session
//       req.session!.userDetails = sessionData.userDetails;
//       req.session!.otp = sessionData.otp;
//       req.session!.otpGeneratedTime = sessionData.otpGeneratedTime;

//       await sendVerifyMail(req, req.body.userName, req.body.email);

//       console.log("Register session data:", req.session);
//       res
//         .status(StatusCodes.OK)
//         .json({ message: "OTP sent for verification", email: req.body.email });
//     } catch (error) {
//       if (error instanceof Error) {
//         res.status(StatusCodes.CONFLICT).json({ message: error.message });
//       } else {
//         res
//           .status(StatusCodes.INTERNAL_SERVER_ERROR)
//           .json({ message: "An unexpected error occurred" });
//       }
//     }
//   }
// );

// method 2 working

// export const userRegisterController = asyncHandler(async (req: Request, res: Response) => {
//   const userService = new UserService();

//   try {
//     const otp = await userService.registerUser(req.body, req.session!);
//     sendVerifyMail(req, req.body.userName, req.body.email);
//     console.log("Register session data:", req.session);
//     res.status(StatusCodes.OK).json({ message: "OTP sent for verification", email: req.body.email });
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(StatusCodes.CONFLICT).json({ message: error.message });
//     } else {
//       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred" });
//     }
//   }
// });

// export const userRegisterController = asyncHandler(async (req: Request, res: Response) => {
//   const userService = new UserService();

//   try {
//     const otp = await userService.registerUser(req.body, req.session!);
//     sendVerifyMail(req, req.body.userName, req.body.email);

//     console.log("Register session data:", req.session);
//     res.status(StatusCodes.OK).json({ message: "OTP sent for verification", email: req.body.email });
//   } catch (error) {
//     res.status(StatusCodes.CONFLICT).json({ message: error.message });
//   }
// });

//Register new user method 1

// export const userRegisterController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const { userName, email, password } = req.body;

//     const userEmail = await findUserByEmail(email);
//     if (userEmail) {
//       res.status(StatusCodes.CONFLICT).json({ message: "Email already exists" });
//       return;
//     }
//     const userId = await findUserByUsername(userName);
//     if (userId) {
//       res.status(StatusCodes.CONFLICT).json({ message: "Username already exists" });
//       return;
//     }

//     const otp = speakeasy.totp({
//       secret: speakeasy.generateSecret({ length: 20 }).base32,
//       digits: 4,
//     });

//     const sessionData = req.session!;
//     sessionData.userDetails = { userName, email, password };
//     sessionData.otp = otp;
//     sessionData.otpGeneratedTime = Date.now();

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Update session with hashed password
//     sessionData.userDetails.password = hashedPassword;

//     sendVerifyMail(req, userName, email);

//     console.log("Register session data:", sessionData);
//     res.status(StatusCodes.OK).json({ message: "OTP sent for verification", email });
//   }
// );

// Register new user

export const userRegisterController = asyncHandler(
  async (req:Request, res:Response) => {
    // console.log("req body 00", req.body);

    const {userName, email, password} = req.body

    const userEmail = await User.findOne({email})
    if(userEmail) {
      res.status(StatusCodes.CONFLICT).json({message: "Email already exist"})
    }
    const userId = await User.findOne({userName})
    if(userId) {
      res.status(StatusCodes.CONFLICT).json({message: "UserName already exist"})
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
    res.status(StatusCodes.OK).json({ message: "OTP sent for verification ", email });
  }
)

// register otp verification

export const verifyOTPController = asyncHandler(
  async (req: Request, res: Response) => {
    // console.log("in verify");

    const { otp } = req.body;
    if (req.session) {
      console.log("in session");
    }
    // console.log("otp verify session here itself ",req.session);
    console.log("enterd otp", otp);

    const sessionData = req.session!;
    console.log("verify session data_3", sessionData);

    const storedOTP = sessionData.otp;
    console.log("storedOTP", storedOTP);

    if (!storedOTP || otp !== storedOTP) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid OTP" });
      return;
      // throw new Error("Invalid OTP")
    }
    const otpGeneratedTime = sessionData.otpGeneratedTime || 0;
    const currentTime = Date.now();
    const otpExpirationTime = 60 * 1000;
    if (currentTime - otpGeneratedTime > otpExpirationTime) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "User details not found in session" });
      // throw new Error("User details not found in session")
    }
    const userDetails = sessionData.userDetails;
    if (!userDetails) {
      // res.status(StatusCodes.BAD_REQUEST).json({message: "User details not found in session"});
      throw new Error("User details not found in session");
    }
    const user = await User.create({
      userName: userDetails.userName,
      email: userDetails.email,
      password: userDetails.password,
    });
    // console.log("zzzzdat1 :", user);

    await Connections.create({
      userId: user._id,
    });
    delete sessionData.userDetails;
    delete sessionData.otp;
    delete sessionData.otpGeneratedTime;
    // console.log("zzzdat2 : ", sessionData);

    res
      .status(StatusCodes.OK)
      .json({ message: "OTP verified, user created", user });
  }
);

// resend otp

export const resendOTPController = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("inside resend otp");
    const { email } = req.body;
    const otp = speakeasy.totp({
      secret: speakeasy.generateSecret({ length: 20 }).base32,
      digits: 4,
    });

    const sessionData = req.session!;
    sessionData.otp = otp;
    sessionData.otpGeneratedTime = Date.now();
    const userDetails = sessionData.userDetails;
    console.log("sessiondata resendotp", sessionData);
    if (!userDetails) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "User details not found in session" });
      // throw new Error("User details not found in session")
      return;
    }
    console.log(sessionData);
    sendVerifyMail(req, userDetails.userName, userDetails.email);
    res
      .status(StatusCodes.OK)
      .json({ message: "OTP sent for verification", email });
  }
);

// forgot password

export const forgotPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user?.isGoogle) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "SignIn with google or Create account" });
      return;
    }

    if (user) {
      const otp = speakeasy.totp({
        secret: speakeasy.generateSecret({ length: 20 }).base32,
        digits: 4,
      });
      // console.log("req session",req.session);
      const sessionData = req.session!;
      sessionData.otp = otp;
      sessionData.otpGeneratedTime = Date.now();
      sessionData.email = email;
      console.log("sessiondata in forgotPasswordController", sessionData);
      sendVerifyMail(req, user.userName, user.email);
      res
        .status(StatusCodes.OK)
        .json({ message: `OTP has been send to your email`, email });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "User not found" });
      // throw new Error("Not User Found");
    }
  }
);

// forgot password otp verification

export const forgotOtpController = asyncHandler(
  async (req: Request, res: Response) => {
    const { otp } = req.body;
    // console.log("otp verification ", otp);
    if (!otp) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Please provide OTP" });
      return;
      // throw new Error("Please provide OTP");
    }
    const sessionData = req.session!;
    const storedOTP = sessionData.otp;
    console.log("stored otp", storedOTP);
    if (!storedOTP || otp !== storedOTP) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid OTP" });
      return;
      // throw new Error("Invalid OTP")
    }
    const otpGeneratedTime = sessionData.otpGeneratedTime || 0;
    const currentTime = Date.now();
    const otpExpirationTime = 60 * 1000;
    if (currentTime - otpGeneratedTime > otpExpirationTime) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "OTP has expired" });
      return;
      // throw new Error("OTP has expired");
    }

    delete sessionData.otp;
    delete sessionData.otpGeneratedTime;
    // console.log("sessiondata in forgotOtpController", sessionData);
    res
      .status(StatusCodes.OK)
      .json({
        message: "OTP has been verified. Please reset password",
        email: sessionData?.email,
      });
  }
);

// reset password

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { password, confirmPassword } = req.body;
    const sessionData = req.session;
    console.log("sessiondata in resetPasswordController", sessionData);
    if (!sessionData || !sessionData.email) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "No session data found in session" });
      return;
    }

    if (password !== confirmPassword) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Password do not match" });
      return;
    }

    const user = await User.findOne({ email: sessionData.email });
    if (!user) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "User not found" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user ? (user.password = hashedPassword) : null;
    await user?.save();
    res
      .status(StatusCodes.OK)
      .json({ message: "Password has been reset successfully" });
  }
);

// Login user

export const userLoginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log("email: ", email, "Password: ", password);

    const user = await User.findOne({ email });
    if (user?.isBlocked) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "user is blocked" });
      return;
    }
    if (user?.isDeleted) {
      res.status(400).json({ message: "user not exist in this email" });
      return;
    }

    const refreshToken = generateRefreshToken(user?.id);

    if (
      user &&
      typeof user.password === "string" &&
      (await bcrypt.compare(password, user.password))
    ) {
      await new RefreshToken({ token: refreshToken, userId: user.id }).save(); //save locally @db

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true, //cant be accesssed by js
        secure: process.env.NODE_ENV === "development", //secure in production (HTTPS)
        sameSite: "strict",
      });

      res.status(StatusCodes.OK).json({
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
        token: generateToken(user.id),
      });
    } else {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "invalid credentails" });
      // throw new Error("Invalid credentails");
    }
  }
);

export const refreshTheToken = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("Cookies received:", req.cookies);
    console.log("Headers received:", req.headers);

    const refreshToken = req.cookies?.refreshToken;
    console.log("Refresh token from cookie:", refreshToken);

    if (!refreshToken) {
      console.log("No refresh token found in cookie");
      // Try to get token from Authorization header as fallback
      const authHeader = req.headers["authorization"];
      const headerToken =
        authHeader && authHeader.startsWith("Bearer ")
          ? authHeader.slice(7)
          : null;
      console.log("Refresh token from header:", headerToken);

      if (!headerToken) {
        res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "Access denied, no refresh token" });
        return;
      }
    }

    const tokenToUse =
      refreshToken || (req.headers["authorization"] as string)?.split(" ")[1];

    if (!tokenToUse) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Access denied, no refresh token" });
      return;
    }

    const storedToken = await RefreshToken.findOne({ token: tokenToUse });
    if (!storedToken) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Invalid refresh token" });
      return;
    }

    try {
      const secretKey = process.env.JWT_REFRESH_SECRET_KEY;
      if (!secretKey) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({
            message: "Internal server error: missing JWT refresh secret key.",
          });
        return;
      }

      const decoded = jwt.verify(tokenToUse, secretKey) as { id: string };
      const accessToken = generateToken(decoded.id);
      res.status(StatusCodes.OK).json({ accessToken });
    } catch (error) {
      console.error("Token verification error:", error);
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Invalid or expired refresh token" });
    }
  }
);

//Logout with removing refresh token from db
export const userLogoutController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "No refresh token provided" });
    }

    // Delete the refresh token from the database
    await RefreshToken.findOneAndDelete({ token: refreshToken });

    // Clear the cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(StatusCodes.OK).json({ message: "Logged out successfully" });
  }
);

// Google authentication

export const googleAuthController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userName, email, profileImg } = req.body.userData;
    console.log("request body", req.body);
    console.log("user datas ", userName, email, profileImg);
    try {
      const userExist = await User.findOne({ email });

      if (userExist) {
        if (userExist.isBlocked) {
          res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "User is blocked" });
          return;
        }

        if (userExist.isDeleted) {
          res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "user not exist in this email" });
          return;
        }
        if (userExist.isGoogle) {
          res.json({
            message: "Login succussfull",
            _id: userExist.id,
            userName: userExist.userName,
            email: userExist.email,
            name: userExist.name,
            profileImg: userExist.profileImg,
            bio: userExist.bio,
            phone: userExist.phone,
            token: generateToken(userExist.id),
          });
          return;
        } else {
          res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "User already Exist with this email" });
        }
      }

      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const newUser = await User.create({
        userName: userName,
        email: email,
        password: hashedPassword,
        profileImg: profileImg,
        isGoogle: true,
      });
      await Connections.create({
        userId: newUser._id,
      });

      const newUserId: any = newUser?._id;

      const token = generateToken(newUserId);

      res.status(StatusCodes.OK).json({
        message: "Login succussfull",
        _id: newUser.id,
        userName: newUser.userName,
        email: newUser.email,
        name: newUser.name,
        profileImg: newUser.profileImg,
        bio: newUser.bio,
        phone: newUser.phone,
        token: token,
      });
    } catch (error) {
      console.error("Error in Google authentication:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    }
  }
);

export const userSuggestionsController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      // console.log("userid",userId);

      const connection = await Connections.findOne({ userId });
      // console.log("conn",connection);

      const userQuery = {
        _id: { $ne: userId },
        isDeleted: false,
        isBlocked: false,
      };

      // let suggestedUsers = await User.find().limit(4)
      let suggestedUsers;

      if (
        !connection ||
        (connection?.followers.length === 0 &&
          connection?.following.length === 0)
      ) {
        suggestedUsers = await User.find(userQuery)
          .select("profileImg userName name createdAt")
          .sort({ createdAt: -1 }) // Ensure sorting is applied here as well
          .limit(4);
      } else {
        const followingUsers = connection.following;
        suggestedUsers = await User.find({
          ...userQuery,
          _id: { $nin: [...followingUsers, userId] },
        })
          .select("profileImg userName name createdAt")
          .sort({ createdAt: -1 })
          .limit(4);
      }

      // console.log("suggestedUsers", suggestedUsers);
      res.status(StatusCodes.OK).json({ suggestedUsers });
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }
);

// Edit profile
export const editProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { userId, image, userName, name, phone, bio, gender } = req.body;
      // console.log("detailsssssssss", userId, image, userName, name, phone, bio, gender);
      const user = await User.findOne({ _id: userId });
      if (!user) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "User not found" });
        return;
      }
      // const userExist = await User.findOne({ userName:userName });
      // if (userExist && (userExist._id.toString() !== userId)) {
      //   res.status(StatusCodes.BAD_REQUEST).json({ message: "Username taken" });
      //   return
      // }
      if (userName) user.userName = userName;
      if (name) user.name = name;
      if (image) user.profileImg = image;
      if (phone) user.phone = phone;
      if (bio) user.bio = bio;
      if (gender) user.gender = gender;

      await user.save();

      res.status(StatusCodes.OK).json({
        _id: user.id,
        userName: user.userName,
        name: user.name,
        email: user.email,
        profileImg: user.profileImg,
        bio: user.bio,
        phone: user.phone,
        token: generateToken(user.id),
      });
    } catch (error) {
      console.error(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  }
);

export const getAllUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const users = await User.find({ isDeleted: false })
        .select("userName name profileImg isVerified")
        .sort({ createdAt: -1 });

      const userIds = users.map((user) => user._id);
      const connections = await Connections.find({ userId: { $in: userIds } });

      const result = users.map((user) => {
        // const userConnection = connections.find(conn => conn.userId.toString() === user._id.toString());
        const userConnection = connections.find((conn) =>
          conn.userId.toString()
        ); //issue with inteface

        return {
          ...user.toObject(),
          followersCount: userConnection ? userConnection.followers.length : 0,
          followingCount: userConnection ? userConnection.following.length : 0,
        };
      });
      console.log("result", result);
      res.status(StatusCodes.OK).json({ users: result });
    } catch (error) {
      console.error("Error fetching users and connections:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  }
);

export const getUserDetailsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    // console.log("useridddddd",userId);
    const user = await User.findById(userId);
    // console.log('user : ',user);
    const connections = await Connections.findOne({ userId });
    // console.log('connections :', connections);
    if (user) {
      res.status(StatusCodes.OK).json({ user, connections });
    } else {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Internal Server Error" });
    }
  }
);

export const userSearchController = asyncHandler(
  async (req: Request, res: Response) => {
    const { searchQuery } = req.body; //req been destructuring
    if (!searchQuery || searchQuery.trim() === "") {
      res.status(StatusCodes.OK).json({ suggestedUsers: [] });
      return;
    }
    let users;
    try {
      users = await User.find({
        userName: { $regex: searchQuery, $options: "i" },
        isBlocked: false,
        isDeleted: false,
      }).limit(6);
      // console.log("search users", users);
      res.status(StatusCodes.OK).json({ suggestedUsers: users });
    } catch (error) {
      console.error("Error fetching users:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  }
);

export const changePasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, currentPassword, newPassword } = req.body;
    // console.log(userId, currentPassword, newPassword);
    const user = await User.findById(userId);
    if (!user) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "User not found" });
      return;
    }
    if (
      user &&
      typeof user.password === "string" &&
      (await bcrypt.compare(currentPassword, user.password))
    ) {
      console.log("inside user");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
      await user.save();
      res
        .status(StatusCodes.OK)
        .json({ message: "Password has been reset successfully" });
      return;
    } else {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Password is wrong" });
      return;
    }
  }
);

// switch account to private
export const switchAccountController = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("heluu");

    const { userId } = req.body;
    console.log("user id to switch", userId);
    const user = await User.findById(userId);
    if (!user) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "User not found" });
      return;
    }
    user.isPrivate = !user.isPrivate;
    await user.save();
    const userDetails = {
      _id: user.id,
      userName: user.userName,
      name: user.name,
      bio: user.bio,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      isPrivate: user.isPrivate,
      profileImg: user.profileImg,
      savedPost: user.savedPost,
      token: generateToken(user.id),
    };
    const accountStatus = user.isPrivate ? "Private" : "Public";
    res
      .status(StatusCodes.OK)
      .json({
        userDetails,
        message: `Account has been changed to ${accountStatus}`,
      });
  }
);

export const verifyEmailForEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, userId } = req.body;
    // console.log("email req.body", email, userId);
    const user = await User.findOne({ email });
    const userData = await User.findById(userId);

    if (userData) {
      if (user) {
        res.status(400).json({ message: "Email already exist" });
        return;
      } else {
        const otp = speakeasy.totp({
          secret: speakeasy.generateSecret({ length: 20 }).base32,
          digits: 4,
        });
        const sessionData = req.session!;
        sessionData.otp = otp;
        sessionData.userId = userId;
        sessionData.otpGeneratedTime = Date.now();
        sessionData.email = email;
        console.log("sessiondata in forgotPasswordController", sessionData);
        sendVerifyMail(req, userData.userName, email);
        res
          .status(200)
          .json({ message: `OTP has been send to your email`, email });
      }
    }
  }
);

export const verifyOTPForEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const { otp } = req.body;
    console.log("otp email", otp);

    if (!otp) {
      res.status(400).json({ message: "Please provide OTP" });
      return;
    }
    const sessionData = req.session!;
    const storedOTP = sessionData.otp;
    console.log("stored otp", storedOTP);
    if (!storedOTP || otp !== storedOTP) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }
    const otpGeneratedTime = sessionData.otpGeneratedTime || 0;
    const currentTime = Date.now();
    const otpExpirationTime = 60 * 1000;
    if (currentTime - otpGeneratedTime > otpExpirationTime) {
      res.status(400).json({ message: "OTP has expired" });
      return;
    }

    const email = sessionData?.email;
    const userId = sessionData?.userId;
    const user = await User.findById(userId);
    if (user) {
      user.email = email;
      await user.save();
    }
    delete sessionData.otp;
    delete sessionData.otpGeneratedTime;

    const userData = await User.findById(userId);
    // const mssg = "Email has been updated"
    res.status(200).json({
      _id: userData?.id,
      userName: userData?.userName,
      name: userData?.name,
      bio: userData?.bio,
      email: userData?.email,
      phone: userData?.phone,
      gender: userData?.gender,
      profileImg: userData?.profileImg,
      savedPost: userData?.savedPost,
      token: generateToken(userData?.id),
    });
    // res.status(200).json({ message: "Email has been updated" })
  }
);

export const deleteAccountController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.body;
    console.log("delete acc", userId);
    const user = await User.findById(userId);
    if (!user) {
      res.status(500).json({ message: "User not found" });
      return;
    }
    user.isDeleted = true;
    await user.save();
    res.status(200).json({ message: "Your account has been deleted" });
  }
);
