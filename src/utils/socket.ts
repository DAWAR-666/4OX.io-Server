import { Server } from "socket.io";
import http from "http";
import Room from "../models/room";
import { getGame ,createGame,setGame,deleteGame, getAllGame} from "./game";
import { piece, Player } from "./types";
import User from "../models/user";
export const initializeSocket=(server:http.Server)=>{
    const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL as string  // production frontend URL
]
    const io=new Server(server,{
        cors:{
            origin:allowedOrigins,
            methods:['GET','POST'],
            credentials:true
        }
    });
    io.on("connection",(socket)=>{
        console.log(socket.id+" connected");
        
        socket.on("joinRoom",async(roomId:string,userId:string)=>{
            let gameState = getGame(roomId);
    
    // If player is already in this game, don't add them again
    const existingPlayer = gameState?.players.find(p => p.id === userId);
    if (existingPlayer) {
        existingPlayer.socketId = socket.id; // Update socket ID in case of refresh
        socket.join(roomId);
        return io.to(roomId).emit("gameState", gameState);
    }
            const isRoom=await Room.findOne({roomId});
            if(!isRoom){
                console.log("Room not found: "+roomId);
                socket.emit("error","Room not found");
                return;
            }
            const user = await User.findById(userId)
            if(!user) {
                socket.emit("error", "User not found")
                return
            }
            socket.join(roomId);
            console.log(socket.id+" joined room "+roomId);
            if(!gameState){
                const newGame=createGame();
                const player:Player={id:userId,socketId:socket.id,userName:user.userName,symbol:'X',queue:[]};
                newGame.players.push(player);
                setGame(roomId,newGame);
                gameState=newGame;
                socket.emit("gameState",gameState);
            }
            else if(gameState?.players.length===1){
                const isAlreadyIn = gameState.players.find(p => p.id === userId);
                    if (isAlreadyIn) {
                    // Just update the socketId in case they refreshed
                    isAlreadyIn.socketId = socket.id;
                    socket.emit("gameState", gameState);
                    return;
                }
                const player:Player={id:userId,socketId:socket.id,userName:user.userName,symbol:'O',queue:[]};
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
        socket.on("gameMove",async({roomId,cellIndex}:{roomId:string,cellIndex:number})=>{
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
            player.queue.push({id: `${socket.id}-${Date.now()}`,cellIndex});
            gameState.dissappearingPcs = null
            if (player.queue.length > 3) {
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
                gameState.winner=player.userName;
                setGame(roomId,gameState);
                io.to(roomId).emit("gameState", gameState)
                io.to(roomId).emit("gameOver", { winner: player })
                try{
                    const winnerUser = await User.findById(player.id)
                    const loserUser = await User.findById(opponent!.id)

                    if(winnerUser) {
                    winnerUser.stats.wins += 1
                    winnerUser.stats.totalGames += 1
                    winnerUser.stats.winRate = Math.round((winnerUser.stats.wins / winnerUser.stats.totalGames) * 100)
                    await winnerUser.save()
                    }

                    if(loserUser) {
                    loserUser.stats.losses += 1
                    loserUser.stats.totalGames += 1
                    loserUser.stats.winRate = Math.round((loserUser.stats.wins / loserUser.stats.totalGames) * 100)
                    await loserUser.save()
                    }
                }catch(err){
                    console.error("Failed to update stats", err)
                }
                deleteGame(roomId)
                return
            }
            gameState.currentTurn=opponent!.socketId;
            setGame(roomId,gameState);
            io.to(roomId).emit("gameState",gameState);
        })
        
        socket.on("disconnect",async()=>{
            const allGames=getAllGame()
            if(!allGames)return
            const games=Object.entries(allGames)
            for(const [roomId,gameState] of games){
                const inGame=gameState.players.some((p:Player)=>p?.socketId===socket.id)
                if(inGame){
                    if(gameState.status==='playing'){
                        io.to(roomId).emit("opponentLeft")
                    }
                    deleteGame(roomId)
                    await Room.findOneAndDelete({ roomId }).catch(err =>
                        console.error("Failed to delete room", err)
                    )
                    break
                }
            }
        }
        );
    });
                
}