class PieceEncoder {
  static NO_PIECE = 0;

  static packPiece(pieceKind, pieceColor) {
    return (pieceColor << 3) | pieceKind;
  }

  static unpackPiece(packedPiece) {
    return {pieceKind: packedPiece & 0b111, pieceColor: packedPiece >> 3};
  }

  static fromPieceCharacter(pieceCharacter) {
    const pieceColor = pieceCharacter === pieceCharacter.toLowerCase()
      ? Piece.pieceColors.BLACK
      : Piece.pieceColors.WHITE;

      let pieceKind;

      switch (pieceCharacter.toLowerCase()) {
        case 'p': // pawn
          pieceKind = Piece.pieceKinds.PAWN;
          break;
        case 'n': // knight
          pieceKind = Piece.pieceKinds.KNIGHT;
          break;
        case 'b': // bishop
          pieceKind = Piece.pieceKinds.BISHOP;
          break;
        case 'r': // rook
          pieceKind = Piece.pieceKinds.ROOK;
          break;
        case 'q': // queen
          pieceKind = Piece.pieceKinds.QUEEN;
          break;
        case 'k': // king
          pieceKind = Piece.pieceKinds.KING;
          break;
      }

      return PieceEncoder.packPiece(pieceKind, pieceColor);
  }
}
