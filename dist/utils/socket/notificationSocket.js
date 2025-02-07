"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.notificationSocket = void 0;
let notificationNamespace = null;
const users = {}; // userId -> socketId mapping
const notificationSocket = (io) => {
    notificationNamespace = io.of("/notifications");
    notificationNamespace.on("connection", (socket) => {
        console.log("A notification user connected to /notifications namespace");
        socket.on("addUser", (userId) => {
            users[userId] = socket.id;
            console.log(`User ${userId} added with socket ID: ${socket.id}`);
        });
        socket.on("disconnect", () => {
            console.log("A notification user disconnected from /notifications namespace");
            for (const userId in users) {
                if (users[userId] === socket.id) {
                    delete users[userId];
                    console.log(`User ${userId} removed on disconnect`);
                    break;
                }
            }
        });
    });
};
exports.notificationSocket = notificationSocket;
// Function to send notifications
const sendNotification = (userId, data) => {
    if (notificationNamespace) {
        const ownerSocketId = users[userId]; //userId or receiverId, the images owner whose post been liked
        if (ownerSocketId) {
            notificationNamespace.to(ownerSocketId).emit("notification", data);
            console.log(`Notification sent to user ${userId}:`, data);
        }
        else {
            console.log(`User ${userId} is not connected`);
        }
    }
};
exports.sendNotification = sendNotification;
