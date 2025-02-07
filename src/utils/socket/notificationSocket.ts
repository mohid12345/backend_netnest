import { Server, Namespace } from "socket.io";

let notificationNamespace: Namespace | null = null;
const users: { [key: string]: string } = {}; // userId -> socketId mapping

export const notificationSocket = (io: Server) => {
  notificationNamespace = io.of("/notifications");

  notificationNamespace.on("connection", (socket) => {
    console.log("A notification user connected to /notifications namespace");

    socket.on("addUser", (userId: string) => {
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


// Function to send notifications
export const sendNotification = (userId: string, data: any) => {
   if (notificationNamespace) {
    const ownerSocketId = users[userId];//userId or receiverId, the images owner whose post been liked
    if (ownerSocketId) {
      notificationNamespace.to(ownerSocketId).emit("notification", data);
      console.log(`Notification sent to user ${userId}:`, data);
    } else {
      console.log(`User ${userId} is not connected`);
    }
  }
};