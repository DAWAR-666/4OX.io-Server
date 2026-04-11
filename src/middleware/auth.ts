import jwt from 'jsonwebtoken';
import User from '../models/user';
import {Response,NextFunction } from 'express';
import { AuthRequest } from '../utils/types';
interface JwtPayload {
    _id: string;
}
export const userAuth=async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try{
        const {token}=req.cookies;
        if(!token){
            return res.status(401).json({message:"Unauthorized"})
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET as string) as JwtPayload;
        const user=await User.findById(decoded._id);
        if(!user){
            return res.status(401).json({message:"user not found"})
        }
        req.user=user;
        next();
    } catch (err) {
        return res.status(401).json({message:"Invalid token"+err})
    }
}