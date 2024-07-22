const BOARD_SIZE = 8;


class GameState {
  // TODO: make all these constants private

  static WHITE_KING_SIDE_ROOK_POSITION
    = PositionEncoder.fromAlgebraicNotation('h1');
  static WHITE_QUEEN_SIDE_ROOK_POSITION
    = PositionEncoder.fromAlgebraicNotation('a1');
  static BLACK_KING_SIDE_ROOK_POSITION
    = PositionEncoder.fromAlgebraicNotation('h8');
  static BLACK_QUEEN_SIDE_ROOK_POSITION
    = PositionEncoder.fromAlgebraicNotation('a8');

  static WHITE_PAWNS_STARTING_Y = 6;
  static BLACK_PAWNS_STARTING_Y = 1;

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

  cellIsEmpty(position) {
    // TODO: private
    return this.board[position] === PieceEncoder.NO_PIECE;
  }

  cellHasPieceOfColor(position, color) {
    // TODO: private
    return !this.cellIsEmpty(position)
      && PieceEncoder.unpackPiece(this.board[position]).pieceColor === color;
  }

  getPotentialMovesForPieceAtPosition(position) {
    // returns all moves for a piece at a given position,
    // including moves that lead to a check
    if (this.cellIsEmpty(position)) return [];
    const piece = this.board[position];

    const { pieceKind, pieceColor } = PieceEncoder.unpackPiece(piece);

    const oppositeColor = pieceColor === Piece.pieceColors.WHITE
      ? Piece.pieceColors.BLACK
      : Piece.pieceColors.WHITE;

    const potentialMoves = [];

    const { x, y } = PositionEncoder.toCoordinates(position);

    const getAllMovesInDirections = (directions, singleStep = false) => {
      const moves = [];

      for (const [ dx, dy ] of directions) {
        let i = 1;
        let destinationPosition;

        do {
          destinationPosition = PositionEncoder.offsetFrom(position, dx * i, dy * i);
          if (destinationPosition === -1) break;

          if (!this.cellHasPieceOfColor(destinationPosition, pieceColor))
            moves.push(new Move(position, destinationPosition));

          ++i;
        } while (!singleStep && this.cellIsEmpty(destinationPosition));
      }

      return moves;
    };

    const getRookMoves = (singleStep = false) =>
      getAllMovesInDirections([[0, -1], [0, 1], [-1, 0], [1, 0]], singleStep);

    const getBishopMoves = (singleStep = false) =>
      getAllMovesInDirections([[-1, -1], [-1, 1], [1, -1], [1, 1]], singleStep);

    const getQueenMoves = (singleStep = false) =>
      [...getRookMoves(singleStep), ...getBishopMoves(singleStep)];

    switch (pieceKind) {
      case Piece.pieceKinds.PAWN:
        // forwards direction depending on the color of the pawn
        const dy = pieceColor === Piece.pieceColors.WHITE ? -1 : 1;

        // forwards one cell
        const forwardsOneCellPosition = PositionEncoder.offsetFrom(position, 0, dy);

        if (forwardsOneCellPosition !== -1 && this.cellIsEmpty(forwardsOneCellPosition)) {
          const willGetPromoted = pieceColor === Piece.pieceColors.WHITE
            ? y === GameState.BLACK_PAWNS_STARTING_Y
            : y === GameState.WHITE_PAWNS_STARTING_Y;

          if (willGetPromoted)
            for (const promotedPiece of [
              Piece.pieceKinds.KNIGHT,
              Piece.pieceKinds.BISHOP,
              Piece.pieceKinds.ROOK,
              Piece.pieceKinds.QUEEN
            ])
              potentialMoves.push(new Move(position, forwardsOneCellPosition, promotedPiece));
          else
            potentialMoves.push(new Move(position, forwardsOneCellPosition));

          // forwards two cells
          const pawnHasNotMovedYet
            = (pieceColor === Piece.pieceColors.WHITE && y === GameState.WHITE_PAWNS_STARTING_Y)
              || (pieceColor === Piece.pieceColors.BLACK && y === GameState.BLACK_PAWNS_STARTING_Y);

          if (pawnHasNotMovedYet) {
            const forwardsTwoCellsPosition
              = PositionEncoder.offsetFrom(forwardsOneCellPosition, 0, dy);

            if (this.cellIsEmpty(forwardsTwoCellsPosition))
              potentialMoves.push(new Move(position, forwardsTwoCellsPosition));
          }
        }

        // diagonal moves and en passant
        const diagonalPositions = [
          PositionEncoder.leftFrom(forwardsOneCellPosition),
          PositionEncoder.rightFrom(forwardsOneCellPosition)
        ].filter(position => position !== -1)
          .filter(
          position => position === this.enPassantTargetPosition
            || this.cellHasPieceOfColor(position, oppositeColor)
        );

        for (const destinationPosition of diagonalPositions) {
          potentialMoves.push(new Move(position, destinationPosition));
        }

        break;
      case Piece.pieceKinds.ROOK:
        potentialMoves.push(...getRookMoves());
        break;
      case Piece.pieceKinds.KNIGHT:
        potentialMoves.push(...getAllMovesInDirections([
          [-1, -2],
          [1, -2],
          [2, -1],
          [2, 1],
          [1, 2],
          [-1, 2],
          [-2, 1],
          [-2, -1]
        ], true));
        break;
      case Piece.pieceKinds.BISHOP:
        potentialMoves.push(...getBishopMoves());
        break;
      case Piece.pieceKinds.QUEEN:
        potentialMoves.push(...getQueenMoves());
        break;
      case Piece.pieceKinds.KING:
        potentialMoves.push(...getQueenMoves(true));

        // castling moves
        const canCastleKingSide = pieceColor === Piece.pieceColors.WHITE
          ? this.whiteCanCastleKingSide
          : this.blackCanCastleKingSide;

        const canCastleQueenSide = pieceColor === Piece.pieceColors.WHITE
          ? this.whiteCanCastleQueenSide
          : this.blackCanCastleQueenSide;

        if (canCastleKingSide) {
          const destinationPosition = PositionEncoder.offsetFrom(position, 2, 0);

          const inBetweenCellsPositions = [
            PositionEncoder.rightFrom(position),
            destinationPosition
          ];

          if (inBetweenCellsPositions.every(position => this.cellIsEmpty(position)))
            potentialMoves.push(new Move(position, destinationPosition));
        }

        if (canCastleQueenSide) {
          const destinationPosition = PositionEncoder.offsetFrom(position, -2, 0);

          const inBetweenCellsPositions = [
            PositionEncoder.leftFrom(position),
            destinationPosition,
            PositionEncoder.leftFrom(destinationPosition)
          ];

          if (inBetweenCellsPositions.every(position => this.cellIsEmpty(position)))
            potentialMoves.push(new Move(position, destinationPosition));
        }

        break;
    }

    return potentialMoves;
  }

  getPotentialMovesForColor(color) {
    // get all potential moves for the given color
    const potentialMoves = [];

    for (let position = 0; position < this.board.length; ++position) {
      if (this.cellHasPieceOfColor(position, color))
        potentialMoves.push(
          ...this.getPotentialMovesForPieceAtPosition(position)
        );
    }

    return potentialMoves;
  }

  isCheck(color) {
    // whether the king of the given color is checked or not
    const oppositeColor = color === Piece.pieceColors.WHITE
      ? Piece.pieceColors.BLACK
      : Piece.pieceColors.WHITE;

    const potentialMoves = this.getPotentialMovesForColor(oppositeColor);

    const king = PieceEncoder.packPiece(Piece.pieceKinds.KING, color);

    return potentialMoves.some(
      move => this.board[move.destinationPosition] === king
    );
  }

  getLegalMovesForColor(color) {
    // filter the potential moves by moves that don't lead to a check if played
    return this.getPotentialMovesForColor(color).filter(move =>
      !this.withMoveApplied(move).isCheck(color)
    );
  }

  isStaleMate(color) {
    return !isCheck(color) && this.getLegalMovesForColor(color).length === 0;
  }

  isCheckMate(color) {
    return isCheck(color) && this.getLegalMovesForColor(color).length === 0;
  }

  withMoveApplied(move) {
    const piece = this.board[move.originPosition];
    const { pieceKind, pieceColor } = PieceEncoder.unpackPiece(piece);

    const capturedPiece = this.board[move.destinationPosition];

    const newBoard = this.board.slice();

    // move the piece and capture
    newBoard[move.originPosition] = PieceEncoder.NO_PIECE;
    newBoard[move.destinationPosition] = move.promotedPiece !== null
      ? move.promotedPiece
      : piece;

    // capture en passant
    if (
      pieceKind === Piece.pieceKinds.PAWN
      && move.destinationPosition === this.enPassantTargetPosition
    ) {
      let enemyPawnPosition;

      if (pieceColor === Piece.pieceColors.WHITE) // enemy pawn is one cell down
        enemyPawnPosition = PositionEncoder.downFrom(this.enPassantTargetPosition);
      else // enemy pawn is one cell up
        enemyPawnPosition = PositionEncoder.upFrom(this.enPassantTargetPosition);

      newBoard[enemyPawnPosition] = PieceEncoder.NO_PIECE;
    }

    // handle castling
    if (pieceKind === Piece.pieceKinds.KING) {
      let castleRookMove = null;

      if (move.destinationPosition === PositionEncoder.offsetFrom(move.originPosition, 2, 0)) {
        // castle king side
        castleRookMove = new Move(
          PositionEncoder.offsetFrom(move.originPosition, 3, 0),
          PositionEncoder.offsetFrom(move.originPosition, 1, 0)
        );
      } else if (move.destinationPosition === PositionEncoder.offsetFrom(move.originPosition, -2, 0)) {
        // castle queen side
        castleRookMove = new Move(
          PositionEncoder.offsetFrom(move.originPosition, -4, 0),
          PositionEncoder.offsetFrom(move.originPosition, -1, 0)
        );
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

    if (pieceColor === Piece.pieceColors.WHITE) {
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

    // set en passant target
    let newEnPassantTargetPosition = null;

    if (pieceKind === Piece.pieceKinds.PAWN) {
      const { y: originY } = PositionEncoder.toCoordinates(move.originPosition);
      const { y: destinationY } = PositionEncoder.toCoordinates(move.destinationPosition);

      if (Math.abs(destinationY - originY) === 2) {
        if (pieceColor === Piece.pieceColors.WHITE)
          newEnPassantTargetPosition = PositionEncoder.downFrom(move.destinationPosition);
        else
          newEnPassantTargetPosition = PositionEncoder.upFrom(move.destinationPosition);
      }
    }

    const newTurn = this.turn === Piece.pieceColors.WHITE
      ? Piece.pieceColors.BLACK
      : Piece.pieceColors.WHITE;

    const newHalfMoves = (
      !this.cellIsEmpty(move.destinationPosition)
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
