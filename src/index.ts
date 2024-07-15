import express,{ Express } from 'express';
import session from 'express-session';
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db'
import userRoutes from './routes/userRouter'
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

app.use(errorHandler)
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use("/api/", userRoutes)

const PORT = process.env.PORT || 3000
connectDB()

app.listen(PORT, () =>{
  console.log(`server starts running at \x1b[36mhttp://localhost:${PORT}\x1b[0m`)
})