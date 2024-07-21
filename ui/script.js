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


function setup() {
  createCanvas(600, 600);

  gameState = GameState.getInitialState();
}


function draw() {
  background(255);

  drawChessBoard(gameState, 400, width / 2, height / 2);
}


function drawChessBoard(gameState, size, centerX, centerY) {
  push();

  translate(centerX - size / 2, centerY - size / 2);

  const cellSize = size / 8;

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

      // draw the piece
      const chessPiece = gameState.board[PositionEncoder.fromCoordinates(x, y)];

      if (chessPiece === PieceEncoder.NO_PIECE) continue;

      const chessPieceImage = chessPieceImages[chessPiece];
      image(chessPieceImage, pixelX, pixelY, cellSize, cellSize);
    }
  }

  pop();
}


function handleUserInput(gameState, size, centerX, centerY) {

}
