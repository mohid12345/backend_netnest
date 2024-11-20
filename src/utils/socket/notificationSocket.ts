

//implimented with, socket /nofication router
import { Server, Namespace } from "socket.io";

// This function will handle notification-specific socket logic
const notificationSocket = (io: Server) => {
  // Use a specific namespace for notifications
  const notificationNamespace: Namespace = io.of("/notifications");

  const users: { [key: string]: string } = {}; // userId: socketId

  notificationNamespace.on("connection", (socket) => {
    console.log("A notification user connected to /notifications namespace");

    // Handle user connection and add them to the users object
    socket.on("addUser", (userId: string) => {
      users[userId] = socket.id; // Save the user's socket ID
      console.log(`User ${userId} added with socket ID: ${socket.id}`);
    });

    // Handle post-liked event
    socket.on("post-liked", ({ likedBy, postOwnerId }) => {
      console.log(`Post liked by ${likedBy}, notifying owner ${postOwnerId}`);
      const ownerSocketId = users[postOwnerId];
      if (ownerSocketId) {
        notificationNamespace.to(ownerSocketId).emit("notification", {
          message: `${likedBy} liked your post!`,
          type: "like",
        });
      }
    });

    // Handle disconnect event and remove user from users object
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



// // src/utils/socket/notificationSocket.ts
// import { Server } from "socket.io";

// // This function will handle notification-specific socket logic
// const notificationSocket = (io: Server) => {
//   const users: { [key: string]: string } = {}; // userId: socketId

//   io.on("connection", (socket) => {
//     console.log("A notification user connected");

//     // Handle user connection
//     socket.on("addUser", (userId: string) => {
//       users[userId] = socket.id; // Save the user's socket ID
//       console.log(`User ${userId} added with socket ID: ${socket.id}`);
//     });

//     // Handle post-liked event
//     socket.on("post-liked", ({ likedBy, postOwnerId }) => {
//       console.log(`Post liked by ${likedBy}, notifying owner ${postOwnerId}`);
//       const ownerSocketId = users[postOwnerId];
//       if (ownerSocketId) {
//         io.to(ownerSocketId).emit("notification", {
//           message: `${likedBy} liked your post!`,
//           type: "like",
//         });
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("A notification user disconnected");
//       for (const userId in users) {
//         if (users[userId] === socket.id) {
//           delete users[userId];
//           console.log(`User ${userId} removed on disconnect`);
//           break;
//         }
//       }
//     });
//   });
// };

// export default notificationSocket;
