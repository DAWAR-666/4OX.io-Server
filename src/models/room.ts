import mongoose from "mongoose";
interface IRoom extends mongoose.Document{
    roomId:string;
    players:mongoose.Types.ObjectId[];
    gameState:"waiting" | "playing" | "finished";
    winner?:mongoose.Types.ObjectId | null;
}
const roomSchema=new mongoose.Schema<IRoom>({
    roomId:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        minLength:6,
        maxLength:6,
        uppercase:true
    },
    players:{
        type:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }],
        required:true,
        validate(value: mongoose.Types.ObjectId[]) {
            if (value.length < 1 || value.length > 2) {
                throw new Error('A room must have 1 or 2 players');
            }
        }
    },
    gameState:{
        type:String,
        enum:["waiting","playing","finished"],
        default:"waiting",
    },
    winner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    }
},{timestamps:true})
const Room=mongoose.model("Room",roomSchema);
export default Room;