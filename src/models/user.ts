import mongoose from "mongoose";
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

const User=mongoose.model("User",userSchema);
export default User;