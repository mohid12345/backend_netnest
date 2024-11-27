// src/index.ts
import express, { Express } from "express";
import session from "express-session";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import connectDB from "./config/db";
import userRoutes from "./routes/userRouter";
import adminRoutes from "./routes/adminRouter";
import postRoutes from "./routes/postRoutes";
import chatRoutes from "./routes/chatRoutes";
import connectionRoutes from "./routes/connectionRoutes";
import errorHandler from "./middlewares/errorMiddleware";
import { Server } from "socket.io";
import socketIo_Config from "./utils/socket/socket"; // Existing socket configuration
import notificationSocket from "./utils/socket/notificationSocket"; // New notification socket
import cookieParser from "cookie-parser";

dotenv.config();

const app: Express = express();

declare module "express-session" {
  interface Session {
    userDetails?: { userName: string; email: string; password: string };
    otp?: string;
    otpGeneratedTime?: number;
    email: string;
    userId: string;
  }
}

const sessionSecret = process.env.SESSION_SECRET || "default_secret_key";
const sessionMiddleware = session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  },
});

app.use(sessionMiddleware);

const corsOptions = {
  origin: process.env.CORS_PORT,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB();

const PORT = process.env.PORT;
const server = http.createServer(app);

const io: Server = new Server(server, {
  cors: corsOptions,
});

// Use session middleware with Socket.IO
io.use((socket, next) => {
  sessionMiddleware(socket.request as any, {} as any, next as any);
});

// Use a single socket configuration for general socket logic
socketIo_Config(io);

// Set up the notification socket configuration
notificationSocket(io);

app.use("/api/", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/post", postRoutes);
app.use("/api/connection", connectionRoutes);
app.use("/api/chat", chatRoutes);

app.use(errorHandler);

server.listen(PORT, () => {
  console.log(
    `Server starts running at \x1b[36mhttp://localhost:${PORT}\x1b[0m`
  );
});

// Error handling for socket connections
io.on("connect_error", (err) => {
  console.log(`Connection error: ${err.message}`);
});










