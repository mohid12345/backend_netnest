"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccountController = exports.verifyOTPForEmailController = exports.verifyEmailForEmailController = exports.switchAccountController = exports.changePasswordController = exports.userSearchController = exports.getUserDetailsController = exports.getAllUsersController = exports.editProfileController = exports.userSuggestionsController = exports.googleAuthController = exports.userLogoutController = exports.refreshTheToken = exports.userLoginController = exports.resetPasswordController = exports.forgotOtpController = exports.forgotPasswordController = exports.resendOTPController = exports.verifyOTPController = exports.userRegisterController = void 0;
const speakeasy_1 = __importDefault(require("speakeasy"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const generateRefreshToken_1 = __importDefault(require("../utils/generateRefreshToken"));
const connectionModel_1 = __importDefault(require("../models/connections/connectionModel"));
const tokenModel_1 = __importDefault(require("../models/token/tokenModel"));
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userServices_1 = require("../services/userServices");
const UserRepository_1 = require("../respository/UserRepository");
const sendVerifyEmail_1 = __importDefault(require("../utils/sendVerifyEmail"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// method 3 with class base  repository
exports.userRegisterController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userRepository = new UserRepository_1.UserRepository(); // Instantiating the repository
    const userService = new userServices_1.UserService(userRepository); // Injecting the repository into the service layer
    try {
        const { otp, sessionData } = yield userService.registerUser(req.body); //calling the service called registerUser
        // Update session
        req.session.userDetails = sessionData.userDetails;
        req.session.otp = sessionData.otp;
        req.session.otpGeneratedTime = sessionData.otpGeneratedTime;
        yield (0, sendVerifyEmail_1.default)(req, req.body.userName, req.body.email);
        console.log("Register session data:", req.session);
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ message: "OTP sent for verification", email: req.body.email });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.CONFLICT).json({ message: error.message });
        }
        else {
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ message: "An unexpected error occurred" });
        }
    }
}));
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
// export const userRegisterController = asyncHandler(
//   async (req:Request, res:Response) => {
//     // console.log("req body 00", req.body);
//     const {userName, email, password} = req.body
//     const userEmail = await User.findOne({email})
//     if(userEmail) {
//       res.status(StatusCodes.CONFLICT).json({message: "Email already exist"})
//     }
//     const userId = await User.findOne({userName})
//     if(userId) {
//       res.status(StatusCodes.CONFLICT).json({message: "UserName already exist"})
//     }
//     const otp = speakeasy.totp({
//       secret: speakeasy.generateSecret({ length: 20 }).base32,
//       digits: 4,
//     })
//     const sessionData = req.session!;
//     sessionData.userDetails = {userName, email, password}
//     sessionData.otp = otp;
//     sessionData.otpGeneratedTime = Date.now()
//     const salt = await bcrypt.genSalt(10)
//     const hashedPassword = await bcrypt.hash(password, salt)
//     sessionData.userDetails!.password = hashedPassword
//     sendVerifyMail(req, userName, email)
//     console.log("register session0", sessionData);
//     res.status(StatusCodes.OK).json({ message: "OTP sent for verification ", email });
//   }
// )
// register otp verification
exports.verifyOTPController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("in verify");
    const { otp } = req.body;
    if (req.session) {
        console.log("in session");
    }
    const sessionData = req.session;
    const storedOTP = sessionData.otp;
    if (!storedOTP || otp !== storedOTP) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: "Invalid OTP" });
        return;
        // throw new Error("Invalid OTP")
    }
    const otpGeneratedTime = sessionData.otpGeneratedTime || 0;
    const currentTime = Date.now();
    const otpExpirationTime = 60 * 1000;
    if (currentTime - otpGeneratedTime > otpExpirationTime) {
        res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ message: "User details not found in session" });
    }
    const userDetails = sessionData.userDetails;
    if (!userDetails) {
        throw new Error("User details not found in session");
    }
    const user = yield userModel_1.default.create({
        userName: userDetails.userName,
        email: userDetails.email,
        password: userDetails.password,
    });
    yield connectionModel_1.default.create({
        userId: user._id,
    });
    delete sessionData.userDetails;
    delete sessionData.otp;
    delete sessionData.otpGeneratedTime;
    res
        .status(http_status_codes_1.StatusCodes.OK)
        .json({ message: "OTP verified, user created", user });
}));
// resend otp
exports.resendOTPController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("inside resend otp");
    const { email } = req.body;
    const otp = speakeasy_1.default.totp({
        secret: speakeasy_1.default.generateSecret({ length: 20 }).base32,
        digits: 4,
    });
    const sessionData = req.session;
    sessionData.otp = otp;
    sessionData.otpGeneratedTime = Date.now();
    const userDetails = sessionData.userDetails;
    if (!userDetails) {
        res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ message: "User details not found in session" });
        // throw new Error("User details not found in session")
        return;
    }
    console.log(sessionData);
    (0, sendVerifyEmail_1.default)(req, userDetails.userName, userDetails.email);
    res
        .status(http_status_codes_1.StatusCodes.OK)
        .json({ message: "OTP sent for verification", email });
}));
// forgot password
exports.forgotPasswordController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield userModel_1.default.findOne({ email });
    if (user === null || user === void 0 ? void 0 : user.isGoogle) {
        res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ message: "SignIn with google or Create account" });
        return;
    }
    if (user) {
        const otp = speakeasy_1.default.totp({
            secret: speakeasy_1.default.generateSecret({ length: 20 }).base32,
            digits: 4,
        });
        const sessionData = req.session;
        sessionData.otp = otp;
        sessionData.otpGeneratedTime = Date.now();
        sessionData.email = email;
        console.log("sessiondata in forgotPasswordController", sessionData);
        (0, sendVerifyEmail_1.default)(req, user.userName, user.email);
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ message: `OTP has been send to your email`, email });
    }
    else {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: "User not found" });
    }
}));
// forgot password otp verification
exports.forgotOtpController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    if (!otp) {
        res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ message: "Please provide OTP" });
        return;
    }
    const sessionData = req.session;
    const storedOTP = sessionData.otp;
    console.log("stored otp", storedOTP);
    if (!storedOTP || otp !== storedOTP) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: "Invalid OTP" });
        return;
    }
    const otpGeneratedTime = sessionData.otpGeneratedTime || 0;
    const currentTime = Date.now();
    const otpExpirationTime = 60 * 1000;
    if (currentTime - otpGeneratedTime > otpExpirationTime) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: "OTP has expired" });
        return;
    }
    delete sessionData.otp;
    delete sessionData.otpGeneratedTime;
    res
        .status(http_status_codes_1.StatusCodes.OK)
        .json({
        message: "OTP has been verified. Please reset password",
        email: sessionData === null || sessionData === void 0 ? void 0 : sessionData.email,
    });
}));
// reset password
exports.resetPasswordController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, confirmPassword } = req.body;
    const sessionData = req.session;
    console.log("sessiondata in resetPasswordController", sessionData);
    if (!sessionData || !sessionData.email) {
        res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ message: "No session data found in session" });
        return;
    }
    if (password !== confirmPassword) {
        res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ message: "Password do not match" });
        return;
    }
    const user = yield userModel_1.default.findOne({ email: sessionData.email });
    if (!user) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: "User not found" });
        return;
    }
    const salt = yield bcrypt_1.default.genSalt(10);
    const hashedPassword = yield bcrypt_1.default.hash(password, salt);
    user ? (user.password = hashedPassword) : null;
    yield (user === null || user === void 0 ? void 0 : user.save());
    res
        .status(http_status_codes_1.StatusCodes.OK)
        .json({ message: "Password has been reset successfully" });
}));
// Login user
exports.userLoginController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield userModel_1.default.findOne({ email });
    if (user === null || user === void 0 ? void 0 : user.isBlocked) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: "user is blocked" });
        return;
    }
    if (user === null || user === void 0 ? void 0 : user.isDeleted) {
        res.status(400).json({ message: "user not exist in this email" });
        return;
    }
    const refreshToken = (0, generateRefreshToken_1.default)(user === null || user === void 0 ? void 0 : user.id);
    if (user &&
        typeof user.password === "string" &&
        (yield bcrypt_1.default.compare(password, user.password))) {
        yield new tokenModel_1.default({ token: refreshToken, userId: user.id }).save(); //save locally @db
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true, //cant be accesssed by js
            secure: process.env.NODE_ENV === "development", //secure in production (HTTPS)
            sameSite: "strict",
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({
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
            token: (0, generateToken_1.default)(user.id),
        });
    }
    else {
        res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ message: "invalid credentails" });
    }
}));
exports.refreshTheToken = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("Cookies received:", req.cookies);
    console.log("Headers received:", req.headers);
    const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
    console.log("Refresh token from cookie:", refreshToken);
    if (!refreshToken) {
        console.log("No refresh token found in cookie");
        // Try to get token from Authorization header as fallback
        const authHeader = req.headers["authorization"];
        const headerToken = authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : null;
        console.log("Refresh token from header:", headerToken);
        if (!headerToken) {
            res
                .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                .json({ message: "Access denied, no refresh token" });
            return;
        }
    }
    const tokenToUse = refreshToken || ((_b = req.headers["authorization"]) === null || _b === void 0 ? void 0 : _b.split(" ")[1]);
    if (!tokenToUse) {
        res
            .status(http_status_codes_1.StatusCodes.FORBIDDEN)
            .json({ message: "Access denied, no refresh token" });
        return;
    }
    const storedToken = yield tokenModel_1.default.findOne({ token: tokenToUse });
    if (!storedToken) {
        res
            .status(http_status_codes_1.StatusCodes.FORBIDDEN)
            .json({ message: "Invalid refresh token" });
        return;
    }
    try {
        const secretKey = process.env.JWT_REFRESH_SECRET_KEY;
        if (!secretKey) {
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({
                message: "Internal server error: missing JWT refresh secret key.",
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(tokenToUse, secretKey);
        const accessToken = (0, generateToken_1.default)(decoded.id);
        res.status(http_status_codes_1.StatusCodes.OK).json({ accessToken });
    }
    catch (error) {
        console.error("Token verification error:", error);
        res
            .status(http_status_codes_1.StatusCodes.FORBIDDEN)
            .json({ message: "Invalid or expired refresh token" });
    }
}));
// flkjdsfkds
//Logout with removing refresh token from db
exports.userLogoutController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ message: "No refresh token provided" });
    }
    // Delete the refresh token from the database
    yield tokenModel_1.default.findOneAndDelete({ token: refreshToken });
    // Clear the cookie
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({ message: "Logged out successfully" });
}));
// Google authentication
exports.googleAuthController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, email, profileImg } = req.body.userData;
    try {
        const userExist = yield userModel_1.default.findOne({ email });
        if (userExist) {
            if (userExist.isBlocked) {
                res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .json({ message: "User is blocked" });
                return;
            }
            if (userExist.isDeleted) {
                res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
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
                    token: (0, generateToken_1.default)(userExist.id),
                });
                return;
            }
            else {
                res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .json({ message: "User already Exist with this email" });
            }
        }
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = yield bcrypt_1.default.hash(randomPassword, 10);
        const newUser = yield userModel_1.default.create({
            userName: userName,
            email: email,
            password: hashedPassword,
            profileImg: profileImg,
            isGoogle: true,
        });
        yield connectionModel_1.default.create({
            userId: newUser._id,
        });
        const newUserId = newUser === null || newUser === void 0 ? void 0 : newUser._id;
        const token = (0, generateToken_1.default)(newUserId);
        res.status(http_status_codes_1.StatusCodes.OK).json({
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
    }
    catch (error) {
        console.error("Error in Google authentication:", error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Server error" });
    }
}));
exports.userSuggestionsController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        // console.log("userid",userId);
        const connection = yield connectionModel_1.default.findOne({ userId });
        // console.log("conn",connection);
        const userQuery = {
            _id: { $ne: userId },
            isDeleted: false,
            isBlocked: false,
        };
        // let suggestedUsers = await User.find().limit(4)
        let suggestedUsers;
        if (!connection ||
            ((connection === null || connection === void 0 ? void 0 : connection.followers.length) === 0 &&
                (connection === null || connection === void 0 ? void 0 : connection.following.length) === 0)) {
            suggestedUsers = yield userModel_1.default.find(userQuery)
                .select("profileImg userName name createdAt")
                .sort({ createdAt: -1 }) // Ensure sorting is applied here as well
                .limit(4);
        }
        else {
            const followingUsers = connection.following;
            suggestedUsers = yield userModel_1.default.find(Object.assign(Object.assign({}, userQuery), { _id: { $nin: [...followingUsers, userId] } }))
                .select("profileImg userName name createdAt")
                .sort({ createdAt: -1 })
                .limit(4);
        }
        // console.log("suggestedUsers", suggestedUsers);
        res.status(http_status_codes_1.StatusCodes.OK).json({ suggestedUsers });
    }
    catch (err) {
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
}));
// Edit profile
exports.editProfileController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, image, userName, name, phone, bio, gender } = req.body;
        // console.log("detailsssssssss", userId, image, userName, name, phone, bio, gender);
        const user = yield userModel_1.default.findOne({ _id: userId });
        if (!user) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: "User not found" });
            return;
        }
        // const userExist = await User.findOne({ userName:userName });
        // if (userExist && (userExist._id.toString() !== userId)) {
        //   res.status(StatusCodes.BAD_REQUEST).json({ message: "Username taken" });
        //   return
        // }
        if (userName)
            user.userName = userName;
        if (name)
            user.name = name;
        if (image)
            user.profileImg = image;
        if (phone)
            user.phone = phone;
        if (bio)
            user.bio = bio;
        if (gender)
            user.gender = gender;
        yield user.save();
        res.status(http_status_codes_1.StatusCodes.OK).json({
            _id: user.id,
            userName: user.userName,
            name: user.name,
            email: user.email,
            profileImg: user.profileImg,
            bio: user.bio,
            phone: user.phone,
            token: (0, generateToken_1.default)(user.id),
        });
    }
    catch (error) {
        console.error(error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Internal server error" });
    }
}));
exports.getAllUsersController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModel_1.default.find({ isDeleted: false })
            .select("userName name profileImg isVerified")
            .sort({ createdAt: -1 });
        const userIds = users.map((user) => user._id);
        const connections = yield connectionModel_1.default.find({ userId: { $in: userIds } });
        const result = users.map((user) => {
            const userConnection = connections.find((conn) => conn.userId.toString() === String(user._id));
            return Object.assign(Object.assign({}, user.toObject()), { followersCount: userConnection ? userConnection.followers.length : 0, followingCount: userConnection ? userConnection.following.length : 0 });
        });
        console.log("result", result);
        res.status(http_status_codes_1.StatusCodes.OK).json({ users: result });
    }
    catch (error) {
        console.error("Error fetching users and connections:", error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: "Internal Server Error" });
    }
}));
exports.getUserDetailsController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const user = yield userModel_1.default.findById(userId);
    const connections = yield connectionModel_1.default.findOne({ userId });
    if (user) {
        res.status(http_status_codes_1.StatusCodes.OK).json({ user, connections });
    }
    else {
        res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ message: "Internal Server Error" });
    }
}));
exports.userSearchController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchQuery } = req.body;
    if (!searchQuery || searchQuery.trim() === "") {
        res.status(http_status_codes_1.StatusCodes.OK).json({ suggestedUsers: [] });
        return;
    }
    let users;
    try {
        users = yield userModel_1.default.find({
            userName: { $regex: searchQuery, $options: "i" },
            isBlocked: false,
            isDeleted: false,
        }).limit(6);
        res.status(http_status_codes_1.StatusCodes.OK).json({ suggestedUsers: users });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Internal Server Error" });
    }
}));
exports.changePasswordController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, currentPassword, newPassword } = req.body;
    const user = yield userModel_1.default.findById(userId);
    if (!user) {
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "User not found" });
        return;
    }
    if (user &&
        typeof user.password === "string" &&
        (yield bcrypt_1.default.compare(currentPassword, user.password))) {
        console.log("inside user");
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, salt);
        user.password = hashedPassword;
        yield user.save();
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ message: "Password has been reset successfully" });
        return;
    }
    else {
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Password is wrong" });
        return;
    }
}));
// switch account to private
exports.switchAccountController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("heluu");
    const { userId } = req.body;
    const user = yield userModel_1.default.findById(userId);
    if (!user) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: "User not found" });
        return;
    }
    user.isPrivate = !user.isPrivate;
    yield user.save();
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
        token: (0, generateToken_1.default)(user.id),
    };
    const accountStatus = user.isPrivate ? "Private" : "Public";
    res
        .status(http_status_codes_1.StatusCodes.OK)
        .json({
        userDetails,
        message: `Account has been changed to ${accountStatus}`,
    });
}));
exports.verifyEmailForEmailController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, userId } = req.body;
    // console.log("email req.body", email, userId);
    const user = yield userModel_1.default.findOne({ email });
    const userData = yield userModel_1.default.findById(userId);
    if (userData) {
        if (user) {
            res.status(400).json({ message: "Email already exist" });
            return;
        }
        else {
            const otp = speakeasy_1.default.totp({
                secret: speakeasy_1.default.generateSecret({ length: 20 }).base32,
                digits: 4,
            });
            const sessionData = req.session;
            sessionData.otp = otp;
            sessionData.userId = userId;
            sessionData.otpGeneratedTime = Date.now();
            sessionData.email = email;
            console.log("sessiondata in forgotPasswordController", sessionData);
            (0, sendVerifyEmail_1.default)(req, userData.userName, email);
            res
                .status(200)
                .json({ message: `OTP has been send to your email`, email });
        }
    }
}));
exports.verifyOTPForEmailController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    console.log("otp email", otp);
    if (!otp) {
        res.status(400).json({ message: "Please provide OTP" });
        return;
    }
    const sessionData = req.session;
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
    const email = sessionData === null || sessionData === void 0 ? void 0 : sessionData.email;
    const userId = sessionData === null || sessionData === void 0 ? void 0 : sessionData.userId;
    const user = yield userModel_1.default.findById(userId);
    if (user) {
        user.email = email;
        yield user.save();
    }
    delete sessionData.otp;
    delete sessionData.otpGeneratedTime;
    const userData = yield userModel_1.default.findById(userId);
    // const mssg = "Email has been updated"
    res.status(200).json({
        _id: userData === null || userData === void 0 ? void 0 : userData.id,
        userName: userData === null || userData === void 0 ? void 0 : userData.userName,
        name: userData === null || userData === void 0 ? void 0 : userData.name,
        bio: userData === null || userData === void 0 ? void 0 : userData.bio,
        email: userData === null || userData === void 0 ? void 0 : userData.email,
        phone: userData === null || userData === void 0 ? void 0 : userData.phone,
        gender: userData === null || userData === void 0 ? void 0 : userData.gender,
        profileImg: userData === null || userData === void 0 ? void 0 : userData.profileImg,
        savedPost: userData === null || userData === void 0 ? void 0 : userData.savedPost,
        token: (0, generateToken_1.default)(userData === null || userData === void 0 ? void 0 : userData.id),
    });
    // res.status(200).json({ message: "Email has been updated" })
}));
exports.deleteAccountController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    console.log("delete acc", userId);
    const user = yield userModel_1.default.findById(userId);
    if (!user) {
        res.status(500).json({ message: "User not found" });
        return;
    }
    user.isDeleted = true;
    yield user.save();
    res.status(200).json({ message: "Your account has been deleted" });
}));
