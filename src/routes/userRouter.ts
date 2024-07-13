import express from "express";

const router = express.Router()

import {
    userRegisterController
} from '../controllers/userController.ts'

router.post('/register', userRegisterController)

export default router