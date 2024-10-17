import { createNotification } from "../../helpers/notificationHelpers";


const nofi_socketIo_Config = (io: any) => {
// Socket.IO setup
io.on("connection", (socket:any) => {
    console.log("A user connected:", socket.id);
  
    socket.on("join", (userId: any) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });
  
    socket.on("createNotification", async (data: any) => {
      try {
        const newNotification = await createNotification(data);
        io.to(data.receiverId).emit("newNotification", newNotification);
      } catch (error) {
        console.error("Error creating notification:", error);
      }
    });
  
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
}

export default nofi_socketIo_Config