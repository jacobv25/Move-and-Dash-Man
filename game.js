//#region VARIABLES 
  // point
  let point;
  let pointSize = 20;
  let minimumDistance = 200; // Define the minimum distance the point can be from the player

  // Timer
  let timer;
  let gameDuration = 10000;  //1,000 milliseconds = 1 seconds
  let gameStart;
  let gameRunning = false; 
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
  let startButtonWasPressed = false;

  //game over screen
  let gameDurationInSecs;
  let scoreCategories = [
    { name: "Greens Collected Points", value: () => score, multiplier: 50 },
    { name: "Blues Destroyed Points", value: () => enemiesDestroyed, multiplier: 10 },
    { name: "Style Points", value: () => closeCalls, multiplier: 1 },
    { name: "Time Alive", value: () => gameDurationInSecs, multiplier: 1 }
  ];
  let enemiesDestroyed = 0;
  let startY, textLineHeight, textStartY, gameOverTextY, separatorY, totalScoreY, restartTextY, textX;

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
  createNewPoint();
  gameStart = millis();  // Record the start time of the game
  // Create a reset button and attach event
  resetButton = createButton('Reset Game');
  resetButton.position(19, 19);
  resetButton.mousePressed(resetGame);
  resetButton.hide();  // Hide the button until game is over
  // Setup the first shot
  lastShootTime = millis();
  // game over screen
  startY = (height-200) / 2;
  textLineHeight = 50;
  textStartY = startY + textLineHeight;
  gameOverTextY = startY;
  separatorY = textStartY + scoreCategories.length * textLineHeight;
  totalScoreY = separatorY + textLineHeight;
  restartTextY = totalScoreY + textLineHeight;
  textX = (width-400) / 2;
}

function draw() {
  // If the game hasn't started yet, don't execute the rest of the draw function
  if (!gameRunning && !startButtonWasPressed) {
    return;
  }

  background(0);

  drawCheckeredBorder(30, 10);  // Adjust borderSize and squareSize as needed

  // ***********************************************
  // ************  GAME OVER SCREEN  ***************
  // ***********************************************
  if (!gameRunning) {
    fill(255);
    textSize(32);
  
    // Calculate total points
    let totalPoints = 0;

    for (let category of scoreCategories) {
      let points = category.value() * category.multiplier;
      totalPoints += points;
    }
  
    // Display "Game Over!" text
    text("Game Over!", textX, gameOverTextY);
  
    // Display score categories
    for (let i = 0; i < scoreCategories.length; i++) {
      let category = scoreCategories[i];
      let points = category.value() * category.multiplier;
      text(`${category.name} : ${category.value()} x ${category.multiplier} = ${points}`, textX, textStartY + i * textLineHeight);
    }
  
    // Display total points
    text("____________________________", textX, separatorY);
    text(`Total Points : ${totalPoints}`, textX, totalScoreY);
    
    // Display restart instruction
    text("Press SPACE to restart!", textX, restartTextY);
  
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
  if (usingTimer && millis() - gameStart >= gameDuration) {
    gameDurationInSecs = ((millis() - gameStart) / 1000).toFixed(2);
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
    createNewPoint(); 
    score++;  
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
      gameDurationInSecs = ((millis() - gameStart) / 1000).toFixed(2);
      gameRunning = false;
      break;
    }

    // Remove the projectile if it moves off screen
    if (projectiles[i].position.x < 0 || projectiles[i].position.x > width ||
        projectiles[i].position.y < 0 || projectiles[i].position.y > height) {

      projectiles.splice(i, 1);   
    }
  }
  //***************************************
  // ****** PLAYER PROJECTILES ************
  //***************************************
  for (let i = playerProjectiles.length - 1; i >= 0; i--) {
    playerProjectiles[i].update();
    playerProjectiles[i].draw();

    let dPoint = dist(playerProjectiles[i].position.x, playerProjectiles[i].position.y, point.x, point.y);
    if (dPoint < 5 /* projectile radius */ + pointSize / 2) {
      // If the projectile hit the point, move the point and remove the projectile
      point = createVector(random(width), random(height));
      playerProjectiles.splice(i, 1);
      continue;
    }
  
    for (let j = enemies.length - 1; j >= 0; j--) {
      let dEnemy = dist(playerProjectiles[i].position.x, playerProjectiles[i].position.y, enemies[j].position.x, enemies[j].position.y);
      if (dEnemy < 5 /* projectile radius */ + 10 /* enemy radius */) {
        // If the projectile hit an enemy, remove the enemy and the projectile
        enemies.splice(j, 1);
        enemiesDestroyed++;
        playerProjectiles.splice(i, 1);
        break;
      }
    }
    //check if the projectile has already been destroyed
    if(playerProjectiles[i] != null){ 
        // Remove the projectile if it moves off screen
        if (playerProjectiles[i].position.x < 0 || playerProjectiles[i].position.x > width ||
          playerProjectiles[i].position.y < 0 || playerProjectiles[i].position.y > height) {
    
          playerProjectiles.splice(i, 1);   
        }
    }
  }
  //***************************************
  //************* ENEMIES *****************
  //***************************************
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update();
    enemies[i].draw();

    // Check if the enemy hit the player
    let d = dist(player.x, player.y, enemies[i].position.x, enemies[i].position.y);
    if (d < playerSize / 2 + 10 /* enemy radius */) {
      gameDurationInSecs = ((millis() - gameStart) / 1000).toFixed(2);
      gameRunning = false;
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

    // minimumDistance is the minimum spawn distance between the player and the collectable
    noFill();  // Do not fill the circle
    stroke(0, 255, 0);  // Set the stroke color to green
    strokeWeight(2);  // Set the stroke weight
    ellipse(player.x, player.y, minimumDistance * 2);  // Draw the circle
    noStroke();

  }

}

function keyPressed() {
  if (keyCode === 32 && !dashing) {  // 32 is the keyCode for the spacebar
    dashing = true;
    shootPlayerProjectile();
  }
  if (key === 'p') {
    devMode = !devMode;  // Toggle devMode
  }
  if(keyCode === 32 && !gameRunning && startButtonWasPressed){
    console.log("reset");
    resetGame();
  }
}

function resetGame() {
  // Reset game state
  setupPlayer();
  createNewPoint();
  gameStart = millis();
  score = 0;
  gameRunning = true;
  resetButton.hide();  // Hide reset button
  projectiles = []; // Clear all projectiles
  enemies = []; // Clear all enemies
  playerProjectiles = []; // Clear all player projectiles
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

  startButtonWasPressed = true;
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

function createNewPoint() {
  // Create a point that's far enough from the player
  do {
    point = createVector(random(width), random(height));
  } while (dist(player.x, player.y, point.x, point.y) < minimumDistance);
}

