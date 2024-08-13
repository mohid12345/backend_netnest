import express from "express";

const router = express.Router()

import {
    userRegisterController,
    userLoginController,
    verifyOTPController,
    resendOTPController,
    forgotPasswordController,
    forgotOtpController,
    resetPasswordController,
    googleAuthController,
    userSuggestionsController,
    editProfileController,
    getAllUsersController
} from '../controllers/userController'


router.post("/login", userLoginController)
router.post('/register', userRegisterController)
router.post('/verifyOTP', verifyOTPController)
router.post('/resendOTP', resendOTPController)
router.post('/forgot-password', forgotPasswordController)
router.post('/forgot-otp', forgotOtpController)
router.post('/reset-password', resetPasswordController)
router.post('/google-auth', googleAuthController)
router.post("/user-suggestions", userSuggestionsController)
router.post("/edit-profile", editProfileController)
router.post("/get-users", getAllUsersController)


export default router