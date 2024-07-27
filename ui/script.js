let chessPieceImages = {};


function preload() {
  chessPieceImages[
    PieceEncoder.packPiece(Piece.pieceKinds.PAWN, Piece.pieceColors.WHITE)
  ] = loadImage("../assets/images/white_pawn.svg");
  
  chessPieceImages[
    PieceEncoder.packPiece(Piece.pieceKinds.ROOK, Piece.pieceColors.WHITE)
  ] = loadImage("../assets/images/white_rook.svg");

  chessPieceImages[
    PieceEncoder.packPiece(Piece.pieceKinds.KNIGHT, Piece.pieceColors.WHITE)
  ] = loadImage("../assets/images/white_knight.svg");

  chessPieceImages[
    PieceEncoder.packPiece(Piece.pieceKinds.BISHOP, Piece.pieceColors.WHITE)
  ] = loadImage("../assets/images/white_bishop.svg");

  chessPieceImages[
    PieceEncoder.packPiece(Piece.pieceKinds.QUEEN, Piece.pieceColors.WHITE)
  ] = loadImage("../assets/images/white_queen.svg");

  chessPieceImages[
    PieceEncoder.packPiece(Piece.pieceKinds.KING, Piece.pieceColors.WHITE)
  ] = loadImage("../assets/images/white_king.svg");

  chessPieceImages[
    PieceEncoder.packPiece(Piece.pieceKinds.PAWN, Piece.pieceColors.BLACK)
  ] = loadImage("../assets/images/black_pawn.svg");
  
  chessPieceImages[
    PieceEncoder.packPiece(Piece.pieceKinds.ROOK, Piece.pieceColors.BLACK)
  ] = loadImage("../assets/images/black_rook.svg");

  chessPieceImages[
    PieceEncoder.packPiece(Piece.pieceKinds.KNIGHT, Piece.pieceColors.BLACK)
  ] = loadImage("../assets/images/black_knight.svg");

  chessPieceImages[
    PieceEncoder.packPiece(Piece.pieceKinds.BISHOP, Piece.pieceColors.BLACK)
  ] = loadImage("../assets/images/black_bishop.svg");

  chessPieceImages[
    PieceEncoder.packPiece(Piece.pieceKinds.QUEEN, Piece.pieceColors.BLACK)
  ] = loadImage("../assets/images/black_queen.svg");

  chessPieceImages[
    PieceEncoder.packPiece(Piece.pieceKinds.KING, Piece.pieceColors.BLACK)
  ] = loadImage("../assets/images/black_king.svg");
}


let gameState;
let boardSize = 400;
let centerX;
let centerY;
let selectedPiecePosition = null;

let gameOver = false;
let endGameMessage = null;
let endGameMessageShown = false;


function setup() {
  createCanvas(600, 600);

  gameState = GameState.getInitialState();

  centerX = width / 2;
  centerY = height / 2;
}


function draw() {
  background(255);

  drawChessBoard();

  if (gameOver && !endGameMessageShown) {
    // show the alert after updating the board
    setTimeout(alert, 0, endGameMessage);

    endGameMessageShown = true;
  }
}


function drawChessBoard() {
  push();

  translate(centerX - boardSize / 2, centerY - boardSize / 2);

  const cellSize = boardSize / 8;

  rectMode(CORNER);
  imageMode(CORNER);
  noStroke();

  for (let x = 0; x < 8; ++x) {
    for (let y = 0; y < 8; ++y) {
      // draw the cell
      if ((x + y) % 2 === 0) fill(230, 180, 130);
      else fill(170, 95, 20);

      const pixelX = x * cellSize;
      const pixelY = y * cellSize;
      rect(pixelX, pixelY, cellSize);

      const position = PositionEncoder.fromCoordinates(x, y);

      const piece = gameState.board[position];
      const { pieceKind, pieceColor } = PieceEncoder.unpackPiece(piece);

      if (position === selectedPiecePosition) {
        // highlight the cell in green if it is selected
        fill(0, 200, 0, 128);
        rect(pixelX, pixelY, cellSize);
      } else if (pieceKind === Piece.pieceKinds.KING && gameState.isCheck(pieceColor)) {
        // highlight the king's cell in red if it is checked
        fill(200, 0, 0, 128);
        rect(pixelX, pixelY, cellSize);
      }

      if (piece !== PieceEncoder.NO_PIECE) {
        // draw the piece
        const pieceImage = chessPieceImages[piece];
        image(pieceImage, pixelX, pixelY, cellSize, cellSize);
      }
    }
  }

  pop();
}


function mousePressed() {
  const cellSize = boardSize / 8;

  const x = Math.floor((mouseX - (centerX - boardSize / 2)) / cellSize);
  const y = Math.floor((mouseY - (centerY - boardSize / 2)) / cellSize);

  const position = PositionEncoder.fromCoordinates(x, y);

  if (
    gameState.cellHasPieceOfColor(position, gameState.turn)
    && gameState.getLegalMovesForPieceAtPosition(position).length !== 0
  ) {
    selectedPiecePosition = position;
  } else if (selectedPiecePosition !== null) {
    const selectedLegalMoves
      = gameState.getLegalMovesForPieceAtPosition(selectedPiecePosition)
          .filter(
            legalMove => legalMove.originPosition === selectedPiecePosition
              && legalMove.destinationPosition === position
          );

    let move;

    if (selectedLegalMoves.length === 1) {
      move = selectedLegalMoves[0];
    } else if (selectedLegalMoves.length > 0) {
      // chose the piece to promote the pawn to
      const promotedPieceString = prompt('Piece to promote to (B, N, R, Q):');
      const promotedPiece = {
        'B': Piece.pieceKinds.BISHOP,
        'N': Piece.pieceKinds.KNIGHT,
        'R': Piece.pieceKinds.ROOK,
        'Q': Piece.pieceKinds.QUEEN
      }[promotedPieceString];

      move = selectedLegalMoves.find(
        legalMove => legalMove.promotedPiece === promotedPiece
      );
    }

    if (move) {
      gameState = gameState.withMoveApplied(move);
      selectedPiecePosition = null;

      // check for end of game
      if (
        gameState.isStaleMate(Piece.pieceColors.WHITE)
        || gameState.isStaleMate(Piece.pieceColors.BLACK)
      ) {
        gameOver = true;
        endGameMessage = 'Stalemate! Draw.';
      } else if (gameState.isCheckMate(Piece.pieceColors.WHITE)) {
        gameOver = true;
        endGameMessage = 'Checkmate! Black won.';
      } else if (gameState.isCheckMate(Piece.pieceColors.BLACK)) {
        gameOver = true;
        endGameMessage = 'Checkmate! White won.';
      }
    }
  }
}
