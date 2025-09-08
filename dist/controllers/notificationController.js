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
exports.clearNotifications = exports.getNotifications = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const notificationModel_1 = __importDefault(require("../models/notifications/notificationModel"));
const http_status_codes_1 = require("http-status-codes");
exports.getNotifications = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.body.userId;
        const notifications = yield notificationModel_1.default.find({ receiverId: userId })
            .populate({
            path: 'senderId',
            select: 'userName name profileImg',
        })
            .sort({ createdAt: -1 });
        res.status(http_status_codes_1.StatusCodes.OK).json({ notifications: notifications });
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching notifications' });
    }
}));
exports.clearNotifications = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.query;
        if (!userId || typeof userId !== "string") {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: "User ID is required" });
            return;
        }
        const result = yield notificationModel_1.default.deleteMany({ receiverId: userId });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Notifications cleared successfully",
            deletedCount: result.deletedCount,
        });
    }
    catch (error) {
        console.error("Error clearing notifications:", error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error clearing notifications" });
    }
}));
