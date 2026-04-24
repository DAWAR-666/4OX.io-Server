import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/mongo';
import http from 'http';
import { initializeSocket } from './utils/socket';
import authRouter from './routes/auth';
import cookieParser from 'cookie-parser';
import roomRouter from './routes/room';
import userRouter from './routes/user';

dotenv.config();
const app=express();
const httpServer=http.createServer(app);
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL as string  // production frontend URL
]
app.use(cors({
    origin:allowedOrigins,
    credentials: true
}))
app.use(cookieParser());

app.use(express.json());

app.use('/auth', authRouter);
app.use('/room', roomRouter);
app.use('/user', userRouter);

initializeSocket(httpServer);
const PORT = process.env.PORT || 5000
connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB", err);
    process.exit(1);
  });