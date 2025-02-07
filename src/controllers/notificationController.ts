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


