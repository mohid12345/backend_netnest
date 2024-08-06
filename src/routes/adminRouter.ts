import express from 'express'
const router = express.Router()

import { LoginController,
    getDashboardDetails,
    // getPostReports,
    // getPostsController,
    getUsersController,
    userBlockController
} from '../controllers/adminController'


router.post("/login", LoginController)
router.get("/get-users", getUsersController)
router.post("/user-block", userBlockController)
// router.get("/get-posts", getPostsController)
router.get("/get-details", getDashboardDetails)

export default router