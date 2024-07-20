const BOARD_SIZE = 8;


class GameState {
  constructor(
    board,
    turn,
    whiteCanCastleKingSide,
    whiteCanCastleQueenSide,
    blackCanCastleKingSide,
    blackCanCastleQueenSide,
    enPassantTarget, // null for no en passant target
    halfMoves,
    fullMoves
  ) {
    this.board = board;
    this.turn = turn;

    this.whiteCanCastleKingSide = whiteCanCastleKingSide;
    this.whiteCanCastleQueenSide = whiteCanCastleQueenSide;
    this.blackCanCastleKingSide = blackCanCastleKingSide;
    this.blackCanCastleQueenSide = blackCanCastleQueenSide;

    this.enPassantTarget = enPassantTarget;

    this.halfMoves = halfMoves;
    this.fullMoves = fullMoves;
  }

  static fromFEN(fenString) {
    const [
      pieces,
      activeColor,
      castlingRights,
      enPassantTarget,
      halfMoves,
      fullMoves
    ] = fenString.split(' ');

    const board = new Array(BOARD_SIZE ** 2)
      .fill(PieceEncoder.packPiece(Piece.pieceKinds.NO_PIECE));

    let index = 0;

    for (const character of pieces) {
      if (character >= '0' && character <= '8') {
        index += Number.parseInt(character);
        continue;
      }

      if (character === '/') continue;

      board[index] = PieceEncoder.fromPieceCharacter(character);

      ++index;
    }

    return new GameState(
      board,
      activeColor === 'w' ? Piece.pieceColors.WHITE : Piece.pieceColors.BLACK,
      castlingRights.includes('K'),
      castlingRights.includes('Q'),
      castlingRights.includes('k'),
      castlingRights.includes('q'),
      enPassantTarget === '-' ? null : enPassantTarget,
      Number.parseInt(halfMoves),
      Number.parseInt(fullMoves)
    );
  }

  static getInitialState() {
    return GameState.fromFEN(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
  }
}
