class PositionEncoder {
  static fromCoordinates(x, y) {
    // returns the position, or -1 if the position is out of bounds
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE)
      return -1;

    return x + y * BOARD_SIZE;
  }

  static fromAlgebraicNotation(algebraicNotation) {
    const x = 'abcdefgh'.indexOf(algebraicNotation[0]);
    const y = BOARD_SIZE - Number.parseInt(algebraicNotation[1]);

    return PositionEncoder.fromCoordinates(x, y);
  }

  static offsetFrom(position, dx, dy) {
    const { x, y } = PositionEncoder.toCoordinates(position);
    const newX = x + dx;
    const newY = y + dy;

    return PositionEncoder.fromCoordinates(newX, newY);
  }

  static upFrom(position) {
    return PositionEncoder.offsetFrom(position, 0, -1);
  }

  static downFrom(position) {
    return PositionEncoder.offsetFrom(position, 0, 1);
  }

  static rightFrom(position) {
    return PositionEncoder.offsetFrom(position, 1, 0);
  }

  static leftFrom(position) {
    return PositionEncoder.offsetFrom(position, -1, 0);
  }

  static toCoordinates(position) {
    return {x: position % BOARD_SIZE, y: Math.floor(position / BOARD_SIZE)};
  }
}
