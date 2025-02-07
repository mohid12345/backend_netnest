"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = void 0;
const notificationModel_1 = __importDefault(require("../models/notifications/notificationModel"));
const notificationSocket_1 = require("../utils/socket/notificationSocket");
const createNotification = (args) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { senderId, receiverId, message, link, postId, read, isDeleted } = args;
        const newNotification = new notificationModel_1.default({
            senderId,
            receiverId,
            message,
            link,
            postId,
            read,
            isDeleted,
        });
        // Save the notification
        const savedNotification = yield newNotification.save();
        // Populate senderId details for  image been shown in new ws.io notification 
        const populatedNotification = yield savedNotification.populate({
            path: "senderId",
            select: "userName name profileImg",
        });
        // Send notification with populated user details
        (0, notificationSocket_1.sendNotification)(receiverId.toString(), populatedNotification);
        return populatedNotification;
    }
    catch (error) {
        throw new Error("Error creating notification");
    }
});
exports.createNotification = createNotification;
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
