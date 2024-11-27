import { Server, Namespace } from "socket.io";


const notificationSocket = (io: Server) => {
  const notificationNamespace: Namespace = io.of("/notifications");

  const users: { [key: string]: string } = {}; // userId: socketId

  notificationNamespace.on("connection", (socket) => {
    console.log("A notification user connected to /notifications namespace");

    socket.on("addUser", (userId: string) => {
      users[userId] = socket.id; 
      console.log(`User ${userId} added with socket ID: ${socket.id}`);
    });

    // Handle post-liked event
    socket.on("sendNotification", () => {
      console.log("likzzzzzzzzzzz");
      // const ownerSocketId = users[postOwnerId];
      // if (ownerSocketId) {
      //   notificationNamespace.to(ownerSocketId).emit("notification", {
      //     message: `${likedBy} liked your post!`,
      //     type: "like",
      //   });
      // }
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

export default notificationSocket;

