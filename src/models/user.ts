import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    stats:{
        wins:{
            type:Number,
            default:0
        },
        losses:{
            type:Number,
            default:0
        },
        totalGames:{
            type:Number,
            default:0
        },
        winRate:{
            type:Number,
            default:0
        }
    }
},{timestamps:true})
userSchema.methods.comparePassword=async function(password:string){
    const user=this;
    const isValid=await bcrypt.compare(password,user.password);
    return isValid;

}
userSchema.methods.generateToken=async function(){
    const user=this;
    const token=await jwt.sign({_id:user._id},process.env.JWT_SECRET as string,{expiresIn:"8h"});
    return token;
}

const User=mongoose.model("User",userSchema);
export default User;