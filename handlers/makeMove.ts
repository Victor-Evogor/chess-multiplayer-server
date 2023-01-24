import { Socket } from "socket.io";
import { Move } from "@shared/Move";
import { findSocketById } from "../utils/findSocketById";
import { Chess } from "chess.js";
import { SocketEmitEvents } from "@shared/SocketEvents";
import { aiMove } from "../utils/aiMove";
import {QUEEN} from "chess.js"

export const makeMove = async (socket: Socket, move: Move) => {
  if (move.opponentId === "ai") {
    const game = new Chess(socket.data.game);
    try {
      game.move({
        from: move.sourceSquare,
        to: move.targetSquare,
        promotion: QUEEN
      });
    } catch (error) {
      socket.emit<SocketEmitEvents>("invalid move made", error);
      return;
    }

    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        const currentPlayer = game.turn();
        socket.emit<SocketEmitEvents>("game over", {
          type: "checkmate",
          loser: currentPlayer,
        });
      } else if (game.isDraw()) {
        socket.emit<SocketEmitEvents>("game over", { type: "draw" });
      } else if (game.isInsufficientMaterial()) {
        socket.emit<SocketEmitEvents>("game over", {
          type: "insufficient material",
        });
      } else if (game.isStalemate()) {
        socket.emit<SocketEmitEvents>("game over", { type: "stalemate" });
      } else if (game.isThreefoldRepetition()) {
        socket.emit<SocketEmitEvents>("game over", {
          type: "three fold repetition",
        });
      }
    }

    socket.data.game = game.fen();
    socket.emit<SocketEmitEvents>("move made", game.fen());

    // computer plays move and emit the move made to the client here
    const compMove = aiMove(game.fen());
    game.move(compMove);
    socket.data.game = game.fen();
    socket.emit<SocketEmitEvents>("move made", game.fen());
    return 
  }
  const opponent = await findSocketById(move.opponentId);
  if (!opponent) throw new Error("opponent with this socket id not found");
  const game = new Chess(socket.data.game);
  try {
    game.move({
      from: move.sourceSquare,
      to: move.targetSquare,
      promotion:QUEEN
    });
  } catch (error) {
    socket.emit<SocketEmitEvents>("invalid move made", error);
    return;
  }
  if (game.isGameOver()) {
    if (game.isCheckmate()) {
      const currentPlayer = game.turn();
      socket.emit<SocketEmitEvents>("game over", {
        type: "checkmate",
        loser: currentPlayer,
      });
      opponent.emit<SocketEmitEvents>("game over", {
        type: "checkmate",
        loser: currentPlayer,
      });
    } else if (game.isDraw()) {
      socket.emit<SocketEmitEvents>("game over", { type: "draw" });
      opponent.emit<SocketEmitEvents>("game over", { type: "draw" });
    } else if (game.isInsufficientMaterial()) {
      socket.emit<SocketEmitEvents>("game over", {
        type: "insufficient material",
      });
      opponent.emit<SocketEmitEvents>("game over", {
        type: "insufficient material",
      });
    } else if (game.isStalemate()) {
      socket.emit<SocketEmitEvents>("game over", { type: "stalemate" });
      opponent.emit<SocketEmitEvents>("game over", { type: "stalemate" });
    } else if (game.isThreefoldRepetition()) {
      socket.emit<SocketEmitEvents>("game over", {
        type: "three fold repetition",
      });
      opponent.emit<SocketEmitEvents>("game over", {
        type: "three fold repetition",
      });
    }
  }
  opponent.data.game = game.fen();
  socket.data.game = game.fen();
  socket.emit<SocketEmitEvents>("move made", game.fen());
  opponent.emit<SocketEmitEvents>("move made", game.fen());
};
