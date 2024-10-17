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
    getAllUsersController,
    getUserDetailsController ,
    userSearchController,
    changePasswordController,
    switchAccountController,
    refreshTheToken,
    userLogoutController
    
} from '../controllers/userController'

import {getNotifications} from '../controllers/notificationController'

router.post("/login", userLoginController)
router.post("/logout", userLogoutController)
router.post("/token", refreshTheToken)
router.post('/register', userRegisterController)
router.post('/verifyOTP', verifyOTPController)
router.post('/resendOTP', resendOTPController)
router.post('/forgot-password', forgotPasswordController)
router.post('/forgot-otp', forgotOtpController)
router.post('/reset-password', resetPasswordController)
router.post('/google-auth', googleAuthController)
router.post("/user-suggestions", userSuggestionsController)
router.post("/user-search", userSearchController)
router.post("/edit-profile", editProfileController)
router.post("/change-password", changePasswordController)
router.post("/get-notifications", getNotifications)
// router.post("/verifyEmail-forEmail", verifyEmailForEmailController)
// router.post("/verifyOTP-forEmail", verifyOTPForEmailController)
// router.post("/delete-account", deleteAccountController)
router.patch("/switch-to-private", switchAccountController)
router.post("/get-users", getAllUsersController)
router.get("/user-details/:userId", getUserDetailsController)


export default router