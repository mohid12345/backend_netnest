import { Types } from "mongoose";
import Notification from "../models/notifications/notificationModel";
import { NotificationInterface } from "../models/notifications/notificationTypes";
import { sendNotification } from "../utils/socket/notificationSocket";

interface NotificationArgs {
  senderId: Types.ObjectId | undefined | any;
  receiverId: Types.ObjectId | undefined | any;
  message: string | any;
  link: string | any;
  postId?: Types.ObjectId | undefined | any;
  read?: boolean;
  isDeleted?: boolean;
}

export const createNotification = async (args: NotificationArgs): Promise<NotificationInterface> => {
  try {
    const { senderId, receiverId, message, link, postId, read, isDeleted } = args;

    const newNotification = new Notification({
      senderId,
      receiverId,
      message,
      link,
      postId,
      read,
      isDeleted,
    });

    // Save the notification
    const savedNotification = await newNotification.save();

    // Populate senderId details for  image been shown in new ws.io notification 
    const populatedNotification = await savedNotification.populate({
      path: "senderId",
      select: "userName name profileImg",
    });

    // Send notification with populated user details
    sendNotification(receiverId.toString(), populatedNotification);

    return populatedNotification;
  } catch (error) {
    throw new Error("Error creating notification");
  }
};














// import { Types } from "mongoose";
// import Notification from "../models/notifications/notificationModel";
// import { NotificationInterface } from "../models/notifications/notificationTypes";
// import { sendNotification } from "../utils/socket/notificationSocket";


// interface NotificationArgs {
//   senderId: Types.ObjectId|undefined|any;
//   receiverId: Types.ObjectId|undefined|any;
//   message: string|any;
//   link: string|any;
//   postId?: Types.ObjectId|undefined|any;
//   read?: boolean;
//   isDeleted?: boolean;
// }

// export const createNotification = async(args: NotificationArgs) : Promise<NotificationInterface> => {
//   try {
//     const {
//       senderId,
//       receiverId,
//       message,
//       link,
//       postId,
//       read,
//       isDeleted,
//     } = args

//     const newNotification = new Notification({
//       senderId,
//       receiverId,
//       message,
//       link,
//       postId,
//       read,
//       isDeleted,
//     })
   
    

//     const savedNotification = await newNotification.save()
//     sendNotification(receiverId.toString(), savedNotification);
//     return savedNotification
//   } catch (error) {
//     throw new Error('Error creating notification');
//   }
// }
