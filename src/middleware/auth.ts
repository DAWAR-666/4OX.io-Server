import jwt from 'jsonwebtoken';
import User from '../models/user';
import { Request,Response,NextFunction } from 'express';
interface JwtPayload {
    _id: string;
}
export const userAuth=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const {token}=req.cookies;
        if(!token){
            return res.status(401).json({message:"Unauthorized"})
        }
        const decoded=await jwt.verify(token,process.env.JWT_SECRET as string) as JwtPayload;
        console.log("Decoded token:", decoded);
        const user=await User.findById(decoded._id);
        if(!user){
            return res.status(401).json({message:"user not found"})
        }
        (req as any).user=user;
        next();
    } catch (err) {
        return res.status(401).json({message:"Invalid token"+err})
    }
}