import express from "express";
import User from "../models/user";
const authRouter = express.Router();
authRouter.post("/login",async(req,res)=>{
    const {username,password}=req.body;
    const user=await User.findOne({username});
    if(!user){
        return res.status(400).json({message:"Invalid username or password"});
    }
    const isMatch=await user.comparePassword(password);
    if(!isMatch){
        return res.status(400).json({message:"Invalid username or password"});
    }
    const token=await user.generateToken();
    res.cookie("token",token,{expires:new Date(Date.now()+8*3600000)});
    res.json({data:user,message:"Login successful"});
})