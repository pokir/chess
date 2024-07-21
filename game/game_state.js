const BOARD_SIZE = 8;


class GameState {
  static WHITE_KING_SIDE_CASTLE_TARGET_POSITION
    = PositionEncoder.fromAlgebraicNotation('g1');
  static WHITE_QUEEN_SIDE_CASTLE_TARGET_POSITION
    = PositionEncoder.fromAlgebraicNotation('b1');
  static BLACK_KING_SIDE_CASTLE_TARGET_POSITION
    = PositionEncoder.fromAlgebraicNotation('g8');
  static BLACK_QUEEN_SIDE_CASTLE_TARGET_POSITION
    = PositionEncoder.fromAlgebraicNotation('b8');

  static WHITE_KING_SIDE_ROOK_POSITION
    = PositionEncoder.fromAlgebraicNotation('h1');
  static WHITE_QUEEN_SIDE_ROOK_POSITION
    = PositionEncoder.fromAlgebraicNotation('a1');
  static BLACK_KING_SIDE_ROOK_POSITION
    = PositionEncoder.fromAlgebraicNotation('h8');
  static BLACK_QUEEN_SIDE_ROOK_POSITION
    = PositionEncoder.fromAlgebraicNotation('a8');

  static WHITE_KING_SIDE_CASTLE_ROOK_MOVE = new Move(
    GameState.WHITE_KING_SIDE_ROOK_POSITION,
    PositionEncoder.fromAlgebraicNotation('f1')
  );
  static WHITE_QUEEN_SIDE_CASTLE_ROOK_MOVE = new Move(
    GameState.WHITE_QUEEN_SIDE_ROOK_POSITION,
    PositionEncoder.fromAlgebraicNotation('c1')
  );
  static BLACK_KING_SIDE_CASTLE_ROOK_MOVE = new Move(
    GameState.BLACK_KING_SIDE_ROOK_POSITION,
    PositionEncoder.fromAlgebraicNotation('f8')
  );
  static BLACK_QUEEN_SIDE_CASTLE_ROOK_MOVE = new Move(
    GameState.BLACK_QUEEN_SIDE_ROOK_POSITION,
    PositionEncoder.fromAlgebraicNotation('c8')
  );

  constructor(
    board,
    turn,
    whiteCanCastleKingSide,
    whiteCanCastleQueenSide,
    blackCanCastleKingSide,
    blackCanCastleQueenSide,
    enPassantTargetPosition, // null for no en passant target
    halfMoves,
    fullMoves
  ) {
    this.board = board.slice();
    this.turn = turn;

    this.whiteCanCastleKingSide = whiteCanCastleKingSide;
    this.whiteCanCastleQueenSide = whiteCanCastleQueenSide;
    this.blackCanCastleKingSide = blackCanCastleKingSide;
    this.blackCanCastleQueenSide = blackCanCastleQueenSide;

    this.enPassantTargetPosition = enPassantTargetPosition;

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
      .fill(PieceEncoder.NO_PIECE);

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
      enPassantTarget === '-'
        ? null
        : PositionEncoder.fromAlgebraicNotation(enPassantTarget),
      Number.parseInt(halfMoves),
      Number.parseInt(fullMoves)
    );
  }

  static getInitialState() {
    return GameState.fromFEN(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
  }

  getLegalMoves() {
    // TODO: returns all legal move strings
  }

  withMoveApplied(move) {
    const piece = this.board[move.originPosition];
    const { pieceKind } = PieceEncoder.unpackPiece(piece);

    const capturedPiece = this.board[move.destinationPosition];

    const newBoard = this.board.slice();

    // move the piece and capture
    newBoard[move.originPosition] = PieceEncoder.NO_PIECE;
    newBoard[move.destinationPosition] = piece;

    // capture en passant
    if (move.destinationPosition === this.enPassantTargetPosition) {
      let enemyPawnPosition;

      if (this.turn === Piece.pieceColors.WHITE) // enemy pawn is one cell down
        enemyPawnPosition = this.enPassantTargetPosition + BOARD_SIZE;
      else // enemy pawn is one cell up
        enemyPawnPosition = this.enPassantTargetPosition - BOARD_SIZE;

      newBoard[enemyPawnPosition] = Piece.NO_PIECE;
    }

    // handle castling
    if (pieceKind === Piece.pieceKinds.KING) {
      let castleRookMove = null;

      if (this.turn === Piece.pieceColors.WHITE) {
        if (
          this.whiteCanCastleKingSide
          && move.destinationPosition === WHITE_KING_SIDE_CASTLE_TARGET_POSITION
        )
          castleRookMove = WHITE_KING_SIDE_CASTLE_ROOK_MOVE;
        else if (
          this.whiteCanCastleQueenSide
          && move.destinationPosition === WHITE_QUEEN_SIDE_CASTLE_TARGET_POSITION
        )
          castleRookMove = WHITE_QUEEN_SIDE_CASTLE_ROOK_MOVE;
      } else {
        if (
          this.blackCanCastleKingSide
          && move.destinationPosition === BLACK_KING_SIDE_CASTLE_TARGET_POSITION
        )
          castleRookMove = BLACK_KING_SIDE_CASTLE_ROOK_MOVE;
        else if (
          this.blackCanCastleQueenSide
          && move.destinationPosition === BLACK_QUEEN_SIDE_CASTLE_TARGET_POSITION
        )
          castleRookMove = BLACK_QUEEN_SIDE_CASTLE_ROOK_MOVE;
      }

      if (castleRookMove !== null) {
        const rookPiece = this.board[castleRookMove.originPosition];
        newBoard[castleRookMove.originPosition] = PieceEncoder.NO_PIECE;
        newBoard[castleRookMove.destinationPosition] = rookPiece;
      }
    }

    // update castling rights
    let newWhiteCanCastleKingSide = this.whiteCanCastleKingSide;
    let newWhiteCanCastleQueenSide = this.whiteCanCastleQueenSide;
    let newBlackCanCastleKingSide = this.blackCanCastleKingSide;
    let newBlackCanCastleQueenSide = this.blackCanCastleQueenSide;

    if (this.turn === Piece.pieceColors.WHITE) {
      if (pieceKind === Piece.pieceKinds.KING) {
        newWhiteCanCastleKingSide = false;
        newWhiteCanCastleQueenSide = false;
      } else if (pieceKind === Piece.pieceKinds.ROOK) {
        if (move.originPosition === GameState.WHITE_KING_SIDE_ROOK_POSITION)
          newWhiteCanCastleKingSide = false;
        else if (
          move.originPosition === GameState.WHITE_QUEEN_SIDE_ROOK_POSITION
        )
          newWhiteCanCastleQueenSide = false;
      }
    } else {
      if (pieceKind === Piece.pieceKinds.KING) {
        newBlackCanCastleKingSide = false;
        newBlackCanCastleQueenSide = false;
      } else if (pieceKind === Piece.pieceKinds.ROOK) {
        if (move.originPosition === GameState.BLACK_KING_SIDE_ROOK_POSITION)
          newBlackCanCastleKingSide = false;
        else if (
          move.originPosition === GameState.BLACK_QUEEN_SIDE_ROOK_POSITION
        )
          newBlackCanCastleQueenSide = false;
      }
    }

    let newEnPassantTargetPosition = null;

    if (pieceKind === Piece.pieceKinds.PAWN) {
      const originY = move.originPosition / BOARD_SIZE;
      const destinationY = move.destinationPosition / BOARD_SIZE;

      if (Math.abs(destinationY - originY) === 2) {
        if (this.turn === Piece.pieceColors.WHITE)
          newEnPassantTargetPosition = move.destinationPosition + BOARD_SIZE;
        else
          newEnPassantTargetPosition = move.destinationPosition - BOARD_SIZE;
      }
    }

    const newTurn = this.turn === Piece.pieceColors.WHITE
      ? Piece.pieceColors.BLACK
      : Piece.pieceColors.WHITE;

    const newHalfMoves = (
      capturedPiece!== PieceEncoder.NO_PIECE
      || pieceKind === Piece.pieceKinds.PAWN
    ) 
      ? 0
      : this.halfMoves + 1;

    const newFullMoves = this.fullMoves + 1;

    return new GameState(
      newBoard,
      newTurn,
      newWhiteCanCastleKingSide,
      newWhiteCanCastleQueenSide,
      newBlackCanCastleKingSide,
      newBlackCanCastleQueenSide,
      newEnPassantTargetPosition,
      newHalfMoves,
      newFullMoves
    );
  }
}
