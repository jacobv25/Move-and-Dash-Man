// player.js

// player
let player;
let playerVelocity;
let playerSize = 50;
let playerSpeed = 0.5;
let playerFriction = 0.9; // new variable to introduce friction
let dashSpeed = 3;
let dashing = false;
let dashTime = 0;
let maxDashTime = 10;  // how many frames the dash lasts

function setupPlayer() {
  player = createVector(width / 2, height / 2);
  playerVelocity = createVector(0, 0); // start the player with no movement
}

function movePlayer() {
  // player movement
  let speed = (dashing) ? dashSpeed : playerSpeed;
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) {
    playerVelocity.x -= speed;
  }
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) {
    playerVelocity.x += speed;
  }
  if (keyIsDown(87) || keyIsDown(UP_ARROW)) {
    playerVelocity.y -= speed;
  }
  if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) {
    playerVelocity.y += speed;
  }

  // apply friction
  playerVelocity.mult(playerFriction);
  
  // update player position based on velocity
  player.add(playerVelocity);

  // make sure player stays within the screen
  player.x = constrain(player.x, 0 + playerSize / 2, width - playerSize / 2);
  player.y = constrain(player.y, 0 + playerSize / 2, height - playerSize / 2);
}

function drawPlayer() {
  // player
  fill(255, 0, 0);
  ellipse(player.x, player.y, playerSize);
}



