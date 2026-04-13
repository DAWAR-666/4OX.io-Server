import { Server } from "socket.io";
import http from "http";
import Room from "../models/room";
import { getGame ,createGame,setGame,deleteGame} from "./game";
import { piece, Player } from "./types";
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
        socket.on("gameMove",({roomId,cellIndex}:{roomId:string,cellIndex:number})=>{
            const gameState=getGame(roomId);
            if(!gameState){
                socket.emit("error","Game not found");
                return;
            }
            if(gameState.status!=="playing"){
                socket.emit("error","Game is not in playing state");
                return;
            }
            if(gameState.currentTurn!==socket.id){
                socket.emit("error","Not your turn");
                return;
            }
            if(gameState.board[cellIndex]!==null){
                socket.emit("error","Cell is already occupied");
                return;
            }
            const player=gameState.players.find(p=>p.socketId===socket.id);
            const opponent=gameState.players.find(p=>p.socketId!==socket.id);
            if(!player){
                socket.emit("error","Player not found in game");
                return;
            }
            gameState.board[cellIndex]=player.symbol;
            player.queue.push({id:"piece"+cellIndex,cellIndex});
            gameState.dissappearingPcs = null
            if (player.queue.length > 4) {
                const removed = player.queue.shift()!
                gameState.board[removed.cellIndex] = null
                gameState.dissappearingPcs = removed.id
            }
            // Check for win or draw
            const winningCombos=[
                [0,1,2],[3,4,5],[6,7,8], // rows
                [0,3,6],[1,4,7],[2,5,8], // columns
                [0,4,8],[2,4,6] // diagonals
            ];
            const moves=player.queue.map(p=>p.cellIndex);
            const isWinningCombo=winningCombos.some(c=>{
                return c.every(i=>moves.includes(i));
            });
            if(isWinningCombo){
                gameState.status="finished";
                gameState.winner=player.socketId;
                setGame(roomId,gameState);
                io.to(roomId).emit("gameState", gameState)
                io.to(roomId).emit("gameOver", { winner: player })
                return
            }
            gameState.currentTurn=opponent!.socketId;
            setGame(roomId,gameState);
            io.to(roomId).emit("gameState",gameState);
        })
        
        socket.on("disconnect",()=>{
            console.log(socket.id+" disconnected");
        }
        );
    });
                
}