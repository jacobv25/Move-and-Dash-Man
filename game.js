//#region VARIABLES 
  // point
  let point;
  let pointSize = 20;
  // Timer
  let timer;
  let gameDuration = 10000;  //1,000 milliseconds = 1 seconds
  let gameStart;
  let gameRunning = true; 
  let score = 0;
  let resetButton;
  let usingTimer = false;
  // Projectile generation
  let lastShootTime = 0;
  let shootInterval = 1000;  // Shoot a new projectile every 2 seconds
  // Close calls
  let closeCallDistance = 2 * playerSize;
  let closeCalls = 0;
  // Enemies
  let enemySpawnPoint;
  let enemySize = 40;
  let lastSpawnTime = 0;
  let spawnInterval = 2000;  // Spawn a new enemy every second
  //Dev Mode
  let devMode = false;  // Developer mode is off by default
  // Audio SFX
  let song;
  let words = [];
  // Start menu
  let initialStart = true;
//#endregion

function preload() {
  song = loadSound('380823__frankum__yeah-techno-loop.mp3');
}

function setup() {
  // Get the start button element
  startButton = select('#startButton');
  // Assign a callback function for when the button is clicked
  startButton.mouseClicked(startGame);
  createCanvas(800, 600);
  setupPlayer();
  point = createVector(random(width), random(height));
  gameStart = millis();  // Record the start time of the game
  // Create a reset button and attach event
  resetButton = createButton('Reset Game');
  resetButton.position(19, 19);
  resetButton.mousePressed(resetGame);
  resetButton.hide();  // Hide the button until game is over
  // Setup the first shot
  lastShootTime = millis();


}

function draw() {
  // If the game hasn't started yet, don't execute the rest of the draw function
  if (!gameRunning && initialStart) {
    initialStart = false;
    return;
  }

  background(0);

  drawCheckeredBorder(30, 10);  // Adjust borderSize and squareSize as needed

  // ***********************************************
  // ** If game has ended, stop the draw function **
  // ***********************************************
  if (!gameRunning) {
    fill(255);
    textSize(32);
    text("Game Over!", (width-200) / 2, height / 2);
    //display player score
    text("Points Collected : " + score + " x 50 = " + (score * 50), (width-200) / 2, height / 2 + 50);
    text("Danger Points    : " + closeCalls, (width-200) / 2, height / 2 + 100);
    text("______________________ " + score, (width-200) / 2, height / 2 + 150);
    text("Total Points     : " + ((score * 50) + closeCalls), (width-200) / 2, height / 2 + 200);
    song.stop();
    resetButton.show();  // Show reset button
    return;
  }
  drawPlayer();
  // *************************************
  // ********* Draw Collectable **********
  // *************************************
  fill(0, 255, 0);
  ellipse(point.x, point.y, pointSize);
  movePlayer();
  // *************************************
  // *** Check If Game Should Stop *******
  // *************************************
  if (millis() - gameStart >= gameDuration) {
    gameRunning = false;
  }
  // *************************************
  // ********* Dash Mechanic *************
  // *************************************
  if (dashing) {
    dashTime++;
    if (dashTime >= maxDashTime) {
      dashing = false;
      dashTime = 0;
    }
  }
  // *************************************
  // ********* Collect Point *************
  // *************************************
  let distance = dist(player.x, player.y, point.x, point.y);
  if (distance < playerSize / 2 + pointSize / 2) {
    point = createVector(random(width), random(height));
    score++;  // increment score
  }
  //***************************************
  //********* Display Score ***************
  //***************************************
  fill(255);
  textSize(24);
  text("Points: " + score, 30, 50);
  //***************************************
  //********* Display Timer ***************
  //***************************************
  if(usingTimer){
    let timeLeft = (gameDuration - (millis() - gameStart)) / 1000;
    fill(255);
    textSize(24);
    text("Time left: " + floor(timeLeft), 30, 80);  // floor function is used to display only whole seconds
  }
  // *************************************
  // Check if it's time to shoot a new projectile
  // *************************************
  if (millis() - lastShootTime >= shootInterval) {
    shootProjectile();
    lastShootTime = millis();
  }
  // *************************************
  //Check if it's time to spawn a new enemy
  // *************************************
  if (millis() - lastSpawnTime >= spawnInterval) {
    spawnEnemy();
    lastSpawnTime = millis();
  }
  //***************************************
  //************ PROJECTILES **************
  //***************************************
  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].update();
    projectiles[i].draw();

    // Check if the projectile hit the player
    let d = dist(player.x, player.y, projectiles[i].position.x, projectiles[i].position.y);
    if (d < playerSize / 2 + 5 /* projectile radius */) {
      // If the player was hit, reset the game and break the loop
      resetGame();
      break;
    }

    // Remove the projectile if it moves off screen
    if (projectiles[i].position.x < 0 || projectiles[i].position.x > width ||
        projectiles[i].position.y < 0 || projectiles[i].position.y > height) {

      projectiles.splice(i, 1);   
    }
  }
  //***************************************
  //**** Move and draw all the enemies ****
  //***************************************
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update();
    enemies[i].draw();

    // Check if the enemy hit the player
    let d = dist(player.x, player.y, enemies[i].position.x, enemies[i].position.y);
    if (d < playerSize / 2 + 10 /* enemy radius */) {
      // If the player was hit, reset the game and break the loop
      resetGame();
      break;
    }    
  }
  //***************************************
  // Check for close calls
  //***************************************
  if (dashing) {
    for (let i = 0; i < projectiles.length; i++) {
      let d = dist(player.x, player.y, projectiles[i].position.x, projectiles[i].position.y);
      if (d < closeCallDistance) {
        closeCalls++;
        break;
      }
    }
  }
  //***************************************
  // ******** Display YEAH! ***************
  //***************************************
  for (let i = words.length - 1; i >= 0; i--) {
    fill(words[i].color[0], words[i].color[1], words[i].color[2], words[i].opacity);
    textSize(64);
    text("YEAH!!!", words[i].x, words[i].y);
    
    // Decrease opacity
    words[i].opacity -= 5;  // Adjust this value to make the text disappear faster or slower
    
    // Remove the word if it's no longer visible
    if (words[i].opacity <= 0) {
      words.splice(i, 1);
    }
  }
  //***************************************
  //********* Developer Mode **************
  //***************************************
  if (devMode) {
    // Display some debug information
    fill(255);
    textSize(16);
    text("Number of projectiles: " + projectiles.length, 10, 120);
    text("Close calls: " + closeCalls, 10, 150);
    // And any other information you find useful...
    noFill();
    stroke(255, 0, 0);  // Red color
    ellipse(player.x, player.y, closeCallDistance * 2);
    noStroke();
  }

}

function keyPressed() {
  if (keyCode === 32 && !dashing) {  // 32 is the keyCode for the spacebar
    dashing = true;
  }
  if (key === 'p') {
    devMode = !devMode;  // Toggle devMode
  }
}

function resetGame() {
  // Reset game state
  setupPlayer();
  point = createVector(random(width), random(height));
  gameStart = millis();
  score = 0;
  gameRunning = true;
  resetButton.hide();  // Hide reset button
  projectiles = []; // Clear all projectiles
  enemies = []; // Clear all enemies
  //restart song
  song.stop();
  song.play();
}

function createValidSpawnPoint() {
  let safeDistance = 200;  // set the safe distance as per your requirements
  let spawnPoint;

  // Generate a spawn point and check if it is far enough from the player
  do {
    // Generate a spawn point along the edge of the screen
    let spawnSide = floor(random(4));
    switch (spawnSide) {
      case 0:  // Top
        spawnPoint = createVector(random(width), 0);
        break;
      case 1:  // Right
        spawnPoint = createVector(width, random(height));
        break;
      case 2:  // Bottom
        spawnPoint = createVector(random(width), height);
        break;
      case 3:  // Left
        spawnPoint = createVector(0, random(height));
        break;
    }
  } while (p5.Vector.dist(player, spawnPoint) < safeDistance);
  
  return spawnPoint;
}

// This function will be called every 3.8 seconds
function beatEvent() {
  console.log("BEAT");
  // Create a new word
  let newWord = {
    x: random(width),      // Random x position
    y: random(height),     // Random y position
    color: [random(255), random(255), random(255)],  // Random color
    opacity: 255  // Start fully visible
  };
  
  // Add the new word to the array
  words.push(newWord);
}

function startGame() {

  setTimeout(() => {
    beatEvent();  // Call the beat event after 0.7 seconds
    // After 0.7 seconds, schedule the beat events to occur every 3.8 seconds
    setInterval(beatEvent, 3830); // time is in milliseconds PREV BEST INTERVAL 3825 AT 40 SUCCESFUL INTERVALS
  }, 3100); // time is in milliseconds

  // Start the game
  gameRunning = true;
  
  // Hide the start button
  startButton.hide();
  
  // Show the canvas
  select('#defaultCanvas0').show();
  
  // Play the music
  song.play();

  //loop the music
  song.loop();
}

function drawCheckeredBorder(borderSize, squareSize) {
  // Top and bottom borders
  for (let i = 0; i < width; i += squareSize) {
    let j = Math.floor(i / squareSize) % 2;
    for (let k = 0; k < borderSize; k += squareSize) {
      fill((j + k / squareSize) % 2 ? 255 : 0);
      rect(i, k, squareSize, squareSize);
      rect(i, height - k - squareSize, squareSize, squareSize);
    }
  }
  
  // Left and right borders
  for (let i = 0; i < height; i += squareSize) {
    let j = Math.floor(i / squareSize) % 2;
    for (let k = 0; k < borderSize; k += squareSize) {
      fill((j + k / squareSize) % 2 ? 255 : 0);
      rect(k, i, squareSize, squareSize);
      rect(width - k - squareSize, i, squareSize, squareSize);
    }
  }
}

