import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Connections from "../models/connections/connectionModel";
import User from "../models/user/userModel";
import Conversation from "../models/conversations/conversationModel";
import Message from "../models/messages/MessagesModel";
import { s3Upload } from "../utils/cloudStorage/S3Bucket";
import { Schema } from "mongoose";
import { StatusCodes } from "http-status-codes";





export const deleteOneMessage = asyncHandler(
  async (req: Request, res: Response) => { 
    try {
        const { id } = req.query;
      if (!id) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Message ID is required." });
        return; 
      }
      const result = await Message.findByIdAndDelete(id);
      if (!result) {
        res.status(404).json({ error: "Message not found." });
        return;
      }
      res.status(StatusCodes.OK).json({ message: "Message deleted successfully." });
    } catch (err) {
      console.error(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error." });
    }
  }
);

export const deleteConversation = asyncHandler(
  async (req: Request, res: Response) => { 
    console.log('hyumoooooo');
    
    try {
        const { id } = req.query;
      if (!id) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Convesation ID is required." });
        return; 
      }
      const result = await Conversation.findByIdAndDelete(id);
      if (!result) {
        res.status(404).json({ error: "Convesation not found." });
        return;
      }
      res.status(StatusCodes.OK).json({ message: "Convesation deleted successfully." });
    } catch (err) {
      console.error(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error." });
    }
  }
);

// export const deleteOneMessage = asyncHandler(
//   async (req: Request<{ id: string }>, res: Response): Promise<void> => {  // Return type is now void
//     try {
//       // Destructure `id` from query parameters
//       const { id } = req.query;

//       // Ensure `id` is provided and is a valid string
//       if (!id || typeof id !== 'string') {
//         res.status(StatusCodes.BAD_REQUEST).json({ error: "Message ID is required." });
//         return; // Return explicitly after sending the response
//       }

//       // Validate the ID format (check if it's a valid MongoDB ObjectId)
//       if (!Types.ObjectId.isValid(id)) {
//         res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid Message ID format." });
//         return;
//       }

//       // Attempt to delete the message by ID
//       const result = await Message.findByIdAndDelete(id);

//       // If message not found
//       if (!result) {
//         res.status(404).json({ error: "Message not found." });
//         return;
//       }

//       // Success response
//       res.status(StatusCodes.OK).json({ message: "Message deleted successfully." });
//     } catch (err) {
//       // Handle unexpected errors
//       console.error(err);
//       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error." });
//     }
//   }
// );


export const getEligibleUsersController = asyncHandler(
  async(req:Request, res:Response) => {
    try {
      const {userId} = req.body
      const connections = await Connections.findOne(
        {userId},
        {following: 1}
      )
      const followingUsers = connections?.following
      const validUsers = {$or: [{ _id: { $in: followingUsers } }]}
      // $or: [{isPrivate: false}, {_id: {$in: followingUsers}}]
      const users = await User.find(validUsers)
      // console.log("eligible users", users);
      res.status(StatusCodes.OK).json(users)
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }
)

export const addConversationController = asyncHandler(
  async(req:Request, res:Response) => {
    const { senderId, receiverId } = req.body
    // console.log("msg ids",senderId, receiverId);  
    const existConversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    })
    .populate({
      path: "members",
      select: "userName name profileImg isVerified",
    })
    if(existConversation) {
      res.status(StatusCodes.OK).json(existConversation)
      return
    }
    const newConversation = new Conversation({
      members: [senderId, receiverId]
    })
    try {
      const savedConversation = await newConversation.save()
      const conversation = await Conversation.findById(savedConversation._id)
      .populate({
        path: "members",
        select: "userName name profileImg isVerified", 
      })
      res.status(StatusCodes.OK).json(conversation)
    } catch (err) { 
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }
)

export const getUserConversationController = asyncHandler(
  async(req:Request, res:Response) => {
    try {
      const userId = req.params.userId
      const conversations = await Conversation.find({
        members: {$in: [userId]},
      })
      .populate({
        path: "members",
        select: "userName name profileImg isVerified", 
      })
      .sort({updatedAt: -1})
      
      const conversationWithMessages = await Promise.all(
        conversations.map(async (conversation) => {
          const messageCount = await Message.countDocuments({
              conversationId: conversation._id
          })
          return messageCount > 0 ? conversation : null
        })
      )
      const filteredConversations = conversationWithMessages.filter(
        (conversation) => conversation !== null
      )
      // console.log("conversations", filteredConversations);
      res.status(StatusCodes.OK).json(filteredConversations)
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }
)

export const findConversationController = asyncHandler(
  async(req:Request, res:Response) => {
    try {
      const conversation = await Conversation.findOne({
        members: {$all: [req.params.firstUserId, req.params.secondUserId]},
      })
      res.status(StatusCodes.OK).json({conversation})
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  } 
)

// add message
// export const addMessageController = asyncHandler(
//   async (req: Request, res: Response) => {
//     try {
//       const { conversationId, sender, text, sharedPost } = req.body;
//       // console.log("all msg details", conversationId, sender, text, sharedPost);
//       // console.log("sharedPost", sharedPost);
//       let content = text;
//       let attachment = null;
//       let sharedPostData = null;

//       if (req.file) {
//         let type: string;
//         if (req.file.mimetype.startsWith("image/")) {
//           type = "image";
//         } else if (req.file.mimetype.startsWith("video/")) {
//           type = "video";
//         } else if (req.file.mimetype.startsWith("audio/")) {
//           type = "audio";
//         } else {
//           type = "file";
//         }
//         console.log("req.file", req.file);
//         const fileUrl = await s3Upload(req.file);
//         console.log("fileurl", fileUrl);
//         attachment = {
//           type: type,
//           url: fileUrl,
//           filename: fileUrl,
//           size: req.file.size,
//         };
//         content = req.body.messageType;
//       }

//       if (sharedPost) {
//         sharedPostData = sharedPost; // Parse the sharedPost data
//       }
//       // console.log("sharedPostData", sharedPostData);

//       const newMessage = new Message({
//         conversationId,
//         sender,
//         text: content,
//         attachment,
//         sharedPost: sharedPostData,
//       });
//       // console.log("newMessage", newMessage);

//       await Conversation.findByIdAndUpdate(
//         conversationId,
//         { updatedAt: Date.now() },
//         { new: true }
//       );
//       console.log("conversation updated");

//       const savedMessages = await newMessage.save();
//       console.log("savedMessages", savedMessages);
//       res.status(StatusCodes.OK).json(savedMessages);
//     } catch (err) {
//       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
//     }
//   }
// );


//send messag 2 

// interface MulterRequest extends Request {
//   file?: Express.Multer.File; // Make it optional because not every request has a file
// }

// Add message
export const addMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { conversationId, sender, text, sharedPost } = req.body;
      let content = text;
      let attachment = null;
      let sharedPostData = null;

      if (req.file) {
        let type: string;
        if (req.file.mimetype.startsWith("image/")) {
          type = "image";
        } else if (req.file.mimetype.startsWith("video/")) {
          type = "video";
        } else if (req.file.mimetype.startsWith("audio/")) {
          type = "audio";
        } else {
          type = "file";
        }

        const fileUrl = await s3Upload(req.file);
        attachment = {
          type: type,
          url: fileUrl,
          filename: fileUrl,
          size: req.file.size,
        };
        content = req.body.messageType;
      }

      if (sharedPost) {
        sharedPostData = sharedPost;
      }

      const newMessage = new Message({
        conversationId,
        sender,
        text: content,
        attachment,
        sharedPost: sharedPostData,
      });

      await Conversation.findByIdAndUpdate(
        conversationId,
        { updatedAt: Date.now() },
        { new: true }
      );

      const savedMessages = await newMessage.save();
      res.status(StatusCodes.OK).json(savedMessages);
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }
);


// get message
export const getMessagesController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const messages = await Message.find({
        conversationId: req.params.conversationId,
      })
      .populate({
        path: 'sharedPost',
        populate: {
          path: 'userId',
          select: 'userName name profileImg isVerified'
        }
      })
      .populate({
        path: 'sender',
        select: "userName name profileImg isVerified",
      });
      
      res.status(StatusCodes.OK).json(messages);
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }
);




// get last message
export const getLastMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const pipeline: any[] = [
        {
          $sort: { createdAt: -1 }, 
        },
        {
          $group: {
            _id: "$conversationId",
            lastMessage: { $first: "$$ROOT" },
          },
        },
        {
          $replaceRoot: { newRoot: "$lastMessage" },
        },
      ];

      const lastMessages = await Message.aggregate(pipeline);
      res.status(StatusCodes.OK).json(lastMessages);
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }
)

// set message read
export const setMessageReadController = asyncHandler(
  async(req:Request, res:Response) => {
    try {
      const { conversationId, userId } = req.body
      const messages = await Message.updateMany(
        { conversationId: conversationId, sender: { $ne: userId } },
        { $set: { isRead: true }}
      )
      res.status(StatusCodes.OK).json({messages})
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }
)

// get unread messsages
export const getUnReadMessageController = asyncHandler(
  async(req:Request, res:Response) => {
    try { 
      const { conversationId, userId } = req.body
      const messages = await Message.find({
        conversationId: conversationId,
        sender: { $ne: userId },
        isRead: false,
      })
      res.status(StatusCodes.OK).json({messages})
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }
)
