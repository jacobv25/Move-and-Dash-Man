// enemy.js
let enemies = []; // Holds all active projectiles
let enemySpeed = 2; // Speed of projectiles
let size = 20; // Size of the enemy

class Enemy {
    constructor(position) {
        this.position = position.copy(); // Starting position
        this.velocity = p5.Vector.sub(player, position); // Direction towards player
        this.velocity.setMag(enemySpeed); // Set speed
    }

    update() {
        let direction = p5.Vector.sub(player, this.position);
        direction.normalize();
        direction.mult(enemySpeed);
        this.position.add(direction);
    }

    draw() {
        fill(0, 0, 255); // Make the enemy blue, for example
        ellipse(this.position.x, this.position.y, size); // Draw the enemy
    }
}

function spawnEnemy() {
    // Create a new enemy targeting the player and add it to the list
    let spawnPoint = createValidSpawnPoint();
    let enemy = new Enemy(spawnPoint);
    enemies.push(enemy);
}