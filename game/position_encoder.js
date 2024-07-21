class PositionEncoder {
  static fromCoordinates(x, y) {
    return x + y * BOARD_SIZE;
  }

  static fromAlgebraicNotation(algebraicNotation) {
    const x = 'abcdefgh'.indexOf(algebraicNotation[0]);
    const y = BOARD_SIZE - Number.parseInt(algebraicNotation[1]);

    return PositionEncoder.fromCoordinates(x, y);
  }
}
