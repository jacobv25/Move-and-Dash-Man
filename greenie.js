// Create a Greenie class
class Greenie {
    constructor(x, y, size) {
      this.position = createVector(x, y);
      this.size = size;
      this.shootInterval = 1000; // Change this to desired shoot interval in milliseconds
      this.lastShootTime = 0; // Initialize lastShootTime to 0
    }
  
    draw() {
      fill(0, 255, 0);  // green color
      ellipse(this.position.x, this.position.y, this.size);
    }
  
    // A method that checks whether the Greenie has been hit by the player
    hit(player) {
      let d = dist(this.position.x, this.position.y, player.x, player.y);
      return (d < this.size / 2 + playerSize / 2);
    }

    shootProjectile() {
        //print to console if player is not null
        if ( player != null ) {
            //print to console
            console.log("player is not null");
        }
        if (player && millis() - this.lastShootTime >= this.shootInterval) {
          projectiles.push(new Projectile(this.position, player));
          this.lastShootTime = millis();
        }
      }
      
  }
  