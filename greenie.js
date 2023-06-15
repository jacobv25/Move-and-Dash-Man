// Create a Greenie class
class Greenie {
    constructor(x, y, size) {
      this.position = createVector(x, y);
      this.size = size;
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
  }
  