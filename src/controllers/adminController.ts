import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Admin from "../models/admin/adminModel"
import generateAdminToken from "../utils/generateAdminToken";
import User from "../models/user/userModel";
import Post from "../models/post/postModel";


export const LoginController = asyncHandler(
    async(req: Request, res: Response)=> {
        const {email, password} = req.body
        const admin = await Admin.findOne({email})
         // console.log("email & password", email, password);
         if(admin && password == admin.password){
            res.status(200).json({
                message: "Login Successfull",
                _id: admin.id,
                name: admin.name,
                email: admin.email,
                profileImg: admin.profileImg,
                token: generateAdminToken(admin.id)
            })
         } else {
            res.status(400).json({message: "Invalid Credentials"})
         }
    }
)

export const getUsersController= asyncHandler(
    async(req: Request, res: Response) => {
        const users = await User.find({}).sort({date: -1})
        if(users){
            res.status(200).json({users})
        } else {
            res.status(400).json({message: "User not found"})
        }
    }
)


export const userBlockController = asyncHandler(
    async(req:Request, res:Response) => {
      const {userId} = req.body
      const user = await User.findById(userId)
      // console.log(user);
      if(!user) {
        res.status(400).json({message: "User not found"})
        return
      }
      user.isBlocked = !user.isBlocked
      await user.save()
      const users = await User.find({}).sort({date: -1})
      const blockedUser = user.isBlocked ? "Blocked" : "Unblocked"
      res.status(200).json({users, message: `${user.userName} has been ${blockedUser}`})
    }
  )


export const getPostsController = asyncHandler(  
  async(req:Request, res:Response) => {
    const posts = await Post.find({}).sort({date: -1})
    .populate({
      path: "userId",
      select: "userName profileImg",
    })
    if(posts) {
      res.status(200).json({posts})
    } else {
      res.status(400).json({message: "Post not found"})
    }
  }
)
 
  
  export const getDashboardDetails  = asyncHandler(
    async(req:Request, res:Response) => {
  
      const totalUsers = await User.countDocuments();
      const totalPosts = await Post.countDocuments();
      console.log('postsss :',totalPosts);
 
  
      const status = {
        totalUsers,
        totalPosts,
      }
      res.status(200).json(status)
    }
  )