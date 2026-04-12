import express from "express";
import Room from "../models/room";
import { userAuth } from "../middleware/auth";
import { AuthRequest } from "../utils/types";
import { Response } from "express";
import { nanoid } from "nanoid";
const roomRouter=express.Router();
roomRouter.post('/create',userAuth,async(req:AuthRequest,res:Response)=>{
    try{
        const roomId=nanoid(6).toUpperCase();
        const newRoom=new Room({roomId,players:[req.user?._id],gameState:"waiting"});
        await newRoom.save();
        res.status(201).json({message:"Room created",data:{roomId}});
    }catch(err){
        res.status(500).json({message:"Server error"+err})
    }
})