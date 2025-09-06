import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Admin from "../models/admin/adminModel"
import generateAdminToken from "../utils/generateAdminToken";
import User from "../models/user/userModel";
import Post from "../models/post/postModel";
import Report from "../models/report/reportModel";
import { StatusCodes } from "http-status-codes"; 



export const LoginController = asyncHandler(
    async(req: Request, res: Response)=> {
        const {email, password} = req.body
        const admin = await Admin.findOne({email})
         // console.log("email & password", email, password);
         if(admin && password == admin.password){
            res.status(StatusCodes.OK).json({
                message: "Login Successfull",
                _id: admin.id,
                name: admin.name,
                email: admin.email,
                profileImg: admin.profileImg,
                token: generateAdminToken(admin.id)
            })
         } else {
            res.status(StatusCodes.BAD_REQUEST).json({message: "Invalid Credentials"})
         }
    }
)

export const getUsersController= asyncHandler(
    async(req: Request, res: Response) => {
        const users = await User.find({}).sort({date: -1})
        if(users){
            res.status(StatusCodes.OK).json({users})
        } else {
            res.status(StatusCodes.BAD_REQUEST).json({message: "User not found"})
        }
    }
)


export const userBlockController = asyncHandler(
    async(req:Request, res:Response) => {
      const {userId} = req.body
      const user = await User.findById(userId)
      // console.log(user);
      if(!user) {
        res.status(StatusCodes.BAD_REQUEST).json({message: "User not found"})
        return
      }
      user.isBlocked = !user.isBlocked
      await user.save()
      const users = await User.find({}).sort({date: -1})
      const blockedUser = user.isBlocked ? "Blocked" : "Unblocked"
      res.status(StatusCodes.OK).json({users, message: `${user.userName} has been ${blockedUser}`})
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
      res.status(StatusCodes.OK).json({posts})
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({message: "Post not found"})
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
      res.status(StatusCodes.OK).json(status)
    }
  )



  export const postBlockController = asyncHandler(
    async (req: Request, res: Response) => {
      const {postId}  = req.body;
      console.log("postid",postId);
      const post = await Post.findById(postId);
      
      if (!post) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error("Post not found");
      }
      post.isBlocked = !post.isBlocked;    
      await post.save();
  
      const posts = await Post.find({}).sort({ date: -1 }).lean();    
      const blockedPost = post.isBlocked ? "Blocked" : "Unblocked";
      
      res.status(StatusCodes.OK).json({ posts, message: `${post.title} has been ${blockedPost}` });
    }
  );

  export const getPostReports = asyncHandler(
    async(req: Request, res: Response) => {
      const reports = await Report.find({})
      .populate({
        path:'postId',
        populate:({
          path:'userId'
        })
      })
      .sort({date: -1})
      console.log(reports)
      if(reports) {
        console.log("reports", reports);
        res.status(StatusCodes.OK).json({reports})
      } else {
        res.status(404).json({messsage: "No reports found"})
      }
    }
  )
