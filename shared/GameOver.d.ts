export interface GameOver {
  type:
    | "checkmate"
    | "draw"
    | "insufficient material"
    | "stalemate"
    | "three fold repetition";
  loser: "w" | "b";
}
