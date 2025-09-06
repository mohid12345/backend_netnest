import { Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import Notification from '../models/notifications/notificationModel';
import { StatusCodes } from 'http-status-codes';


export const getNotifications = asyncHandler(
  async(req: Request, res: Response):Promise<void> => {
    try {
      const userId = req.body.userId
      const notifications = await Notification.find({receiverId: userId})
      .populate({
        path: 'senderId',
        select: 'userName name profileImg',
      })
      .sort({createdAt: -1})
      res.status(StatusCodes.OK).json({ notifications: notifications })
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching notifications' });
    }
  }
)

export const clearNotifications = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.query; 

      if (!userId || typeof userId !== "string") {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "User ID is required" });
        return;
      }
      
      const result = await Notification.deleteMany({ receiverId: userId });

      res.status(StatusCodes.OK).json({
        message: "Notifications cleared successfully",
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      console.error("Error clearing notifications:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error clearing notifications" });
    }
  }
);



