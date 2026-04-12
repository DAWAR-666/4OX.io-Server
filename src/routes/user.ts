import express from 'express'
import { userAuth } from '../middleware/auth'
import { AuthRequest } from '../utils/types'
import { Response } from 'express'
import User from '../models/user';

const userRouter=express.Router();

userRouter.get('/profile',userAuth,(req:AuthRequest,res:Response)=>{
    try{
        const {password:_,...safeUser}=req.user?.toObject();
        res.status(200).json({message:"User profile",data:{safeUser}})
    }catch(err){
        return res.status(500).json({message:"Server error"+err})
    }
})
export default userRouter;