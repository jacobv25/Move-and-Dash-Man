// projectile.js

let projectiles = [];  // Holds all active projectiles
let projectileSpeed = 3;  // Speed of projectiles

class Projectile {
  constructor(position, target) {
    //check if positon is null
    if (position == null) {
      //print to console
      console.log("Error: Projectile position is null");
    }
    //check if target is null
    if (target == null) {
      //print to console
      console.log("Error: Projectile target is null");
    }
    this.position = position.copy();  // Starting position
    this.target = createVector(target.x, target.y);
    this.velocity = p5.Vector.sub(target, position);  // Direction towards player
    this.velocity.setMag(projectileSpeed);  // Set speed
  }

  update() {
    this.position.add(this.velocity);
  }

  draw() {
    ellipse(this.position.x, this.position.y, 10, 10);
  }

  hitPlayer(player) {
    let d = dist(player.x, player.y, this.position.x, this.position.y);
    return (d < playerSize / 2 + 5);
  }

  isOffScreen() {
    return (this.position.x < 0 || this.position.x > width ||
            this.position.y < 0 || this.position.y > height);
  }
}

function shootProjectile(greenie) {
  // Create a new projectile targeting the player and add it to the list
  let projectile = new Projectile(greenie.position, player);
  projectiles.push(projectile);
}
