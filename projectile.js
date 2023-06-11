// projectile.js

let projectiles = [];  // Holds all active projectiles
let projectileSpeed = 3;  // Speed of projectiles

class Projectile {
  constructor(position, target) {
    this.position = position.copy();  // Starting position
    this.velocity = p5.Vector.sub(target, position);  // Direction towards player
    this.velocity.setMag(projectileSpeed);  // Set speed
  }

  update() {
    this.position.add(this.velocity);  // Move the projectile
  }

  draw() {
    fill(255, 255, 0);  // Color the projectile yellow
    ellipse(this.position.x, this.position.y, 10);  // Draw the projectile
  }
}

function shootProjectile() {
  // Create a new projectile targeting the player and add it to the list
  let projectile = new Projectile(point, player);
  projectiles.push(projectile);
}
