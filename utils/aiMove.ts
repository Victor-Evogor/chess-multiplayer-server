import {Chess} from "chess.js"
import {initGame,  calculateBestMove} from "chess-ai"

export const aiMove = (boardFen: string):string =>{
  const game = new Chess(boardFen);
  initGame(game, 2);
  return calculateBestMove()! 
}
