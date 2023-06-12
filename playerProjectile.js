let playerProjectiles = [];
let playerProjectileSpeed = 3;  // Speed of projectiles

class PlayerProjectile {
  constructor(startPos, velocity, speed) {
    this.position = startPos.copy();
    this.velocity = velocity.copy();
    this.velocity.mult(-1);  // reverse the direction
    this.velocity.normalize();  // make it a unit vector
    this.velocity.mult(speed);  // multiply by the speed
  }

  update() {
    this.position.add(this.velocity);
  }

  draw() {
    fill(255, 0, 0);
    noStroke();
    ellipse(this.position.x, this.position.y, 5, 5);
  }
}


function shootPlayerProjectile() {
  if (dashing) {
    let projectile = new PlayerProjectile(player, playerVelocity, playerProjectileSpeed);
    playerProjectiles.push(projectile);
  }
}

  