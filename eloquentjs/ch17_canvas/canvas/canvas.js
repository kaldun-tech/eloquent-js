// Flip a picture around the vertical line at the given x position in the canvas
function flipHorizontally(context, around) {
  context.translate(around, 0);
  context.scale(-1, 1);
  context.translate(-around, 0);
}

// Supports the same interface as DOMDisplay
class CanvasDisplay {
  constructor(parent, level) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = Math.min(600, level.width * scale);
    this.canvas.height = Math.min(450, level.height * scale);
    parent.appendChild(this.canvas);
    this.cx = this.canvas.getContext("2d");

    // When the player is standing still, keep facing the direction in which it last moved
    this.flipPlayer = false;

    // Track the viewport which describes the portion of the level that is visible
    this.viewport = {
      left: 0,
      top: 0,
      width: this.canvas.width / scale,
      height: this.canvas.height / scale,
    };
  }

  clear() {
    this.canvas.remove();
  }
}

// First compute a new viewport then draw the game scene at the appropriate position
CanvasDisplay.prototype.syncState = function (state) {
  this.updateViewport(state);
  this.clearDisplay(state.status);
  this.drawBackground(state.level);
  this.drawActors(state.actors);
};

// This is similar to DomDisplay.scrollPlayerIntoView but uses the viewport to scroll
CanvasDisplay.prototype.updateViewport = function (state) {
  let view = this.viewport,
    margin = view.width / 3;
  let player = state.player;
  let center = player.pos.plus(player.size.times(0.5));
  // Calls to Math.max and Math.min ensure the viewport does not show space outside the level bounds
  if (center.x < view.left + margin) {
    view.left = Math.max(center.x - margin, 0);
  } else if (center.x > view.left + view.width - margin) {
    view.left = Math.min(
      center.x + margin - view.width,
      state.level.width - view.width
    );
  }
  if (center.y < view.top + margin) {
    view.top = Math.max(center.y - margin, 0);
  } else if (center.y > view.top + view.height - margin) {
    view.top = Math.min(
      center.y + margin - view.height,
      state.level.height - view.height
    );
  }
};

// Use a slightly different color depending on whether the game is won (brighter) or lost (darker)
CanvasDisplay.prototype.clearDisplay = function (status) {
  if (status == "won") {
    this.cx.fillStyle = "rgb(68, 191, 255)";
  } else if (status == "lost") {
    this.cx.fillStyle = "rgb(44, 136, 214)";
  } else {
    this.cx.fillStyle = "rgb(52, 166, 251)";
  }
  this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

/* Draw the background by running through visible tiles using the same trick in the previous touches method
 * otherSprites contains the pictures used for elements other than the player: wall, lava, and coin */
let otherSprites = document.createElement("img");
otherSprites.src = "img/sprites.png";

/* Draw the background by running through visible tiles using the same trick in the previous touches method.
 * Tiles that are not empty are drawn with drawImage. */
CanvasDisplay.prototype.drawBackground = function (level) {
  let { left, top, width, height } = this.viewport;
  let xStart = Math.floor(left);
  let xEnd = Math.ceil(left + width);
  let yStart = Math.floor(top);
  let yEnd = Math.ceil(top + height);

  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      let tile = level.rows[y][x];
      // Only draw non-empty tiles
      if (tile == "empty") continue;
      let screenX = (x - left) * scale;
      let screenY = (y - top) * scale;
      // If the tile is lava, the tileX variable is set to scale. Otherwise, it is set to 0.
      let tileX = tile == "lava" ? scale : 0;
      this.cx.drawImage(
        otherSprites,
        tileX,
        0,
        scale,
        scale,
        screenX,
        screenY,
        scale,
        scale
      );
    }
  }
};

let playerSprites = document.createElement("img");
playerSprites.src = "img/player.png";
const playerXOverlap = 4;

CanvasDisplay.prototype.drawPlayer = function (player, x, y, width, height) {
  // Adjust the player sprite so that it overlaps with the tile
  width += playerXOverlap * 2;
  x -= playerXOverlap;
  if (player.speed.x != 0) {
    this.flipPlayer = player.speed.x < 0;
  }

  // Default to player standing still
  let tile = 8;
  if (player.speed.y != 0) {
    // Player is jumping
    tile = 9;
  } else if (player.speed.x != 0) {
    // Player is running
    tile = Math.floor(Date.now() / 60) % 8;
  }

  this.cx.save();
  if (this.flipPlayer) {
    flipHorizontally(this.cx, x + width / 2);
  }
  let tileX = tile * width;
  this.cx.drawImage(
    playerSprites,
    tileX,
    0,
    width,
    height,
    x,
    y,
    width,
    height
  );
  this.cx.restore();
};

// Draws all the actors in game
CanvasDisplay.prototype.drawActors = function (actors) {
  for (let actor of actors) {
    let width = actor.size.x * scale;
    let height = actor.size.y * scale;
    // Subtract the viewport's left and top to make the actor's position relative to the viewport
    let x = (actor.pos.x - this.viewport.left) * scale;
    let y = (actor.pos.y - this.viewport.top) * scale;
    if (actor.type == "player") {
      this.drawPlayer(actor, x, y, width, height);
    } else {
      // Determine non-player actor type to find the correct sprite
      let tileX = (actor.type == "coin" ? 2 : 1) * scale;
      this.cx.drawImage(
        otherSprites,
        tileX,
        0,
        width,
        height,
        x,
        y,
        width,
        height
      );
    }
  }
};
