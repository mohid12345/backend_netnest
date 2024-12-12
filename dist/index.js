"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const adminRouter_1 = __importDefault(require("./routes/adminRouter"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const connectionRoutes_1 = __importDefault(require("./routes/connectionRoutes"));
const errorMiddleware_1 = __importDefault(require("./middlewares/errorMiddleware"));
const socket_io_1 = require("socket.io");
const socket_1 = __importDefault(require("./utils/socket/socket")); // Existing socket configuration
const notificationSocket_1 = __importDefault(require("./utils/socket/notificationSocket")); // New notification socket
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const sessionSecret = process.env.SESSION_SECRET || "default_secret_key";
const sessionMiddleware = (0, express_session_1.default)({
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
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
(0, db_1.default)();
const PORT = process.env.PORT;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: corsOptions,
});
// Use session middleware with Socket.IO
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});
// Use a single socket configuration for general socket logic
(0, socket_1.default)(io);
// Set up the notification socket configuration
(0, notificationSocket_1.default)(io);
app.use("/api/", userRouter_1.default);
app.use("/api/admin", adminRouter_1.default);
app.use("/api/post", postRoutes_1.default);
app.use("/api/connection", connectionRoutes_1.default);
app.use("/api/chat", chatRoutes_1.default);
app.use(errorMiddleware_1.default);
server.listen(PORT, () => {
    console.log(`Server starts running at \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
});
// Error handling for socket connections
io.on("connect_error", (err) => {
    console.log(`Connection error: ${err.message}`);
});
