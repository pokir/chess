class Move {
  constructor(originPosition, destinationPosition, promotedPiece = null) {
    // promotedPiece: the piece to promote a pawn to (null for no promotion)
    this.originPosition = originPosition;
    this.destinationPosition = destinationPosition;
    this.promotedPiece = promotedPiece;
  }
}
