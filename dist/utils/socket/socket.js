"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const socketIo_Config = (io) => {
    let users = [];
    console.log("users at first :", users);
    io.on("connect", (socket) => {
        console.log("A client connected");
        io.emit("welcome", "this is server hi socket");
        socket.on("disconnect", () => {
            console.log("A client disconnected");
        });
        const removeUser = (socketId) => {
            users = users.filter((user) => user.socketId !== socketId);
        };
        const addUser = (userId, socketId) => {
            console.log("userId at addUser", userId);
            console.log("socketId at addUser", socketId);
            !users.some((user) => user.userId === userId) &&
                users.push({ userId, socketId });
        };
        const getUser = (userId) => {
            console.log("id in getuser", userId);
            console.log("users in getuser", users);
            return users.find((user) => user.userId === userId);
        };
        //when connect
        socket.on("addUser", (userId) => {
            addUser(userId, socket.id);
            console.log("in adduser", users);
            io.emit("getUsers", users);
        });
        // send and get message
        socket.on("sendMessage", ({ senderId, receiverId, text, messageType, file, sharedPost, }) => {
            console.log("Sending message:::", {
                senderId,
                receiverId,
                text,
                messageType,
                file,
                sharedPost,
            });
            const receiver = getUser(receiverId);
            console.log("receiverId :::", receiver);
            if (receiver && receiver.socketId) {
                io.to(receiver.socketId).emit("getMessage", {
                    senderId,
                    text,
                    messageType,
                    file: `https://${bucketName}.s3.${region}.amazonaws.com/${file}`,
                    sharedPost,
                });
            }
            else {
                console.log(`Receiver with userId ${receiverId} not found or offline`);
            }
        });
        //impliment two
        // socket.on(
        //   "sendNotification",
        //   ({
        //     postImage,
        //     receiverId,
        //     senderName,
        //     message,
        //   }: {
        //     postImage: string;
        //     receiverId: string;
        //     senderName: string;
        //     message: string;
        //   }) => {
        //     console.log('Received notification:', { postImage, receiverId, senderName, message });
        //     if (receiverId === 'all') {
        //       // Broadcast to all connected clients
        //       io.emit("getNotifications", {
        //         postImage,
        //         senderName,
        //         message,
        //       });
        //     } else {
        //       const user = getUser(receiverId);
        //       if (user?.socketId) {
        //         io.to(user.socketId).emit("getNotifications", {
        //           postImage,
        //           senderName,
        //           message,
        //         });
        //       } else {
        //         console.log(`User with ID ${receiverId} not found or not connected`);
        //       }
        //     }
        //   }
        // );
        // Listen for "typing" event from client
        socket.on("typing", ({ senderId, recieverId }) => {
            const user = getUser(recieverId);
            if (user) {
                io.to(user.socketId).emit("userTyping", { senderId });
            }
        });
        // Listen for "stopTyping" event from client
        socket.on("stopTyping", ({ senderId, recieverId }) => {
            const user = getUser(recieverId);
            if (user) {
                io.to(user.socketId).emit("userStopTyping", { senderId });
            }
        });
        socket.on("videoCallRequest", (data) => {
            const emitdata = {
                roomId: data.roomId,
                senderName: data.senderName,
                senderProfile: data.senderProfile,
            };
            console.log("videoCallResponse", emitdata);
            console.log("receiverid", data);
            const user = getUser(data.receiverId);
            console.log("receiverid", user);
            if (user) {
                io.to(user.socketId).emit("videoCallResponse", emitdata);
            }
        });
        // When disconnectec
        socket.on("disconnect", () => {
            removeUser(socket.id);
            io.emit("getUsers", users);
        });
    });
};
exports.default = socketIo_Config;
