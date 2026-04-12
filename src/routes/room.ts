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
        const newRoom=new Room({roomId,players:[req.user!._id],gameState:"waiting"});
        await newRoom.save();
        res.status(201).json({message:"Room created",data:{roomId}});
    }catch(err){
        res.status(500).json({message:"Server error"+err})
    }
})
roomRouter.post('/join',userAuth,async(req:AuthRequest,res:Response)=>{
    try{
        const {roomId}=req.body;
        if(!roomId){
            return res.status(400).json({message:"Room ID is required"})
        }
        const room=await Room.findOne({roomId});
        if(!room){
            return res.status(404).json({message:"Room not found"})
        }
        if(room.players.length>=2){
            return res.status(400).json({message:"Room is full"})
        }
        if(room.players.includes(req.user!._id)){
            return res.status(400).json({message:"You are already in this room"})
        }
        room.players.push(req.user!._id);
        room.gameState="playing";
        await room.save();
        res.status(200).json({message:"Room joined",data:{roomId}});
    }catch(err){
        res.status(500).json({message:"Server error"+err})
    } 
})