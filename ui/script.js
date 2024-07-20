function setup() {
  createCanvas(600, 600);

  const gameState = GameState.getInitialState();
  console.log(gameState.board);
}


function draw() {
  background(51);
}
