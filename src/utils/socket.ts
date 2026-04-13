import { Server } from "socket.io";
import http from "http";
import Room from "../models/room";
import { getGame ,createGame,setGame,deleteGame} from "./game";
import { Player } from "./types";
export const initializeSocket=(server:http.Server)=>{
    const io=new Server(server,{
        cors:{
            origin:'http://localhost:5173',
            methods:['GET','POST']
        }
    });
    io.on("connection",(socket)=>{
        console.log(socket.id+" connected");
        
        socket.on("joinRoom",async(roomId:string)=>{
            const isRoom=await Room.findOne({roomId});
            if(!isRoom){
                console.log("Room not found: "+roomId);
                socket.emit("error","Room not found");
                return;
            }
            socket.join(roomId);
            console.log(socket.id+" joined room "+roomId);
            let gameState=getGame(roomId);
            if(!gameState){
                const newGame=createGame();
                const player:Player={id:null,socketId:socket.id,userName:"player1",symbol:'X',queue:[]};
                newGame.players.push(player);
                setGame(roomId,newGame);
                gameState=newGame;
                socket.emit("gameState",gameState);
            }
            else if(gameState?.players.length===1){
                const player:Player={id:null,socketId:socket.id,userName:"player2",symbol:'O',queue:[]};
                gameState?.players.push(player);
                setGame(roomId,gameState);
                gameState.status="playing";
                gameState.currentTurn=gameState.players[0].socketId;
                setGame(roomId,gameState);
                io.to(roomId).emit("gameState",gameState);
            }
            else{
                socket.emit("error","Room is full");
                socket.leave(roomId);
                return;
            }

        })
        
        socket.on("disconnect",()=>{
            console.log(socket.id+" disconnected");
        }
        );
    });
                
}