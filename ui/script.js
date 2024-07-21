function setup() {
  createCanvas(600, 600);

  const gameState = GameState.getInitialState();
  console.log(gameState.board);
}


function draw() {
  background(51);

  drawChessGrid(400, width / 2, height / 2);
}


function drawGame(gameState) {
  // draw the grid
}


function drawChessGrid(size, centerX, centerY) {
  push();

  translate(centerX - size / 2, centerY - size / 2);

  const cellSize = size / 8;

  rectMode(CORNER);
  noStroke();

  for (let x = 0; x < 8; ++x) {
    for (let y = 0; y < 8; ++y) {
      if (x + y % 2 === 0) fill(255);
      else fill(0);

      rect(x * cellSize, y * cellSize, cellSize);
    }
  }

  pop();
}
