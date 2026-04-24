import { Request } from 'express'
import { IUser } from '../models/user'

export interface AuthRequest extends Request {
  user?: IUser  
  cookies: any        // ← add this
  body: any           // ← add this
  params: any         // ← add this
}
export type piece={
    id:string,
    cellIndex:number
}
export type Player={
    id:string|null,
    socketId:string,
    userName:string|null,
    symbol:"X"|"O",
    queue:piece[]
}
export type Game={
    board:(string|null)[],
    players:Player[],
    currentTurn:string,
    status:"waiting"|"playing"|"finished",
    winner:string|null,
    dissappearingPcs:string|null
}
export type GameStore = {
  [roomId: string]: Game
}