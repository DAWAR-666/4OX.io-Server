import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/mongo';
import http from 'http';
import { initializeSocket } from './utils/socket';
import authRouter from './routes/auth';
import { userAuth } from './middleware/auth';
import cookieParser from 'cookie-parser';
dotenv.config();
const app=express();
const httpServer=http.createServer(app);

app.use(cors({origin:'http://localhost:5173'}))
app.use(cookieParser());

app.use(express.json());
app.get('/get-user',userAuth,(req,res)=>{
    res.send('Hello World!')
});
app.use('/auth', authRouter);

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