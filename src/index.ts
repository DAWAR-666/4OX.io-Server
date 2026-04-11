import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/mongo';
import http from 'http';
import { initializeSocket } from './utils/socket';
dotenv.config();
const app=express();
const httpServer=http.createServer(app);

app.use(cors({origin:'http://localhost:5173'}))

app.use(express.json());

app.get('/',(req,res)=>{
    res.json({message: 'Hello World!'});
});

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