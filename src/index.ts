import express,{ Express } from 'express';
import session, {
  SessionOptions,
  MemoryStore,
  SessionData,
} from "express-session"
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db'
import userRoutes from './routes/userRouter'
import adminRoutes from './routes/adminRouter'
import postRoutes from './routes/postRoutes'
import connectionRoutes from './routes/connectionRoutes'
import errorHandler from './middlewares/errorMiddleware'

dotenv.config()

const app : Express = express()
declare module "express-session"{
  interface Session{
    userDetails?: {userName: string; email: string; password: string}
    otp?: string;
    otpGeneratedTime?: number;
    email: string;
  }
}

const sessionSecret = process.env.SESSION_SECRET || "default_secret_key"
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  }
}))


app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
}))

// Set COOP and COEP headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');//additional setting for allow googleauth
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

app.use(errorHandler)
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use("/api/", userRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/post", postRoutes)
app.use("/api/connection",connectionRoutes)

const PORT = process.env.PORT || 3000
connectDB()

app.listen(PORT, () =>{
  console.log(`server starts running at \x1b[36mhttp://localhost:${PORT}\x1b[0m`)
})