class PositionEncoder {
  static fromAlgebraicNotation(algebraicNotation) {
    const x = 'abcdefgh'.indexOf(algebraicNotation[0]);
    const y = BOARD_SIZE - Number.parseInt(algebraicNotation[1]);

    return x + y * BOARD_SIZE;
  }
}
