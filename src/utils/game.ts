import { Game,GameStore } from "./types";
export const gameStore:GameStore={};
export const createGame=():Game=>{
    return{
        board:Array(9).fill(null),
        players:[],
        currentTurn:"",
        status:"waiting",
        winner:null,
        dissappearingPcs:null
    }
}
export const getGame=(roomId:string):Game|undefined=>{
    return gameStore[roomId];
}
export const setGame=(roomId:string,game:Game):void=>{
    gameStore[roomId]=game;
}
export const deleteGame=(roomId:string):void=>{
    delete gameStore[roomId];
}