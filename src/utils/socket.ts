import { Server } from "socket.io";
import http from "http";
export const initializeSocket=(server:http.Server)=>{
    const io=new Server(server,{
        cors:{
            origin:'http://localhost:5173',
            methods:['GET','POST']
        }
    });
    io.on("connection",(socket)=>{
        console.log("a user connected");
        socket.on("disconnect",()=>{
            console.log("user disconnected");
        }
        );
    });
                
}