// Plan for a small level
let simpleLevelPlan = `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`;

// The level constructor takes an argument plan and creates a level object
class Level {
  constructor(plan) {
    // Trim is used to remove white space at the start and end of the plan string
    let rows = plan
      .trim()
      .split("\n")
      .map((l) => [...l]);
    // Derive the height and width from the rows
    this.height = rows.length;
    this.width = rows[0].length;
    // Actors are the moving elements in the level
    this.startActors = [];
    // Map over rows and then over their content. Map passes the array index as the second argument to the mapping function.
    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        // For each character used in the level description holds a string if it is a background type or class for actor
        let type = levelChars[ch];
        if (typeof type != "string") {
          // Positions in the game are stored as pairs of coordinates with upper left being (0, 0)
          let pos = new Vec(x, y);
          this.startActors.push(type.create(pos, ch));
          type = "empty";
        }
        return type;
      });
    });
  }
}

// Tracks the state of a running game
class State {
  constructor(level, actors, status) {
    this.level = level;
    this.actors = actors;
    // Starts as playing and switches to won or lost at game end
    this.status = status;
  }

  static start(level) {
    return new State(level, level.startActors, "playing");
  }

  get player() {
    return this.actors.find((a) => a.type == "player");
  }
}

// A 2D vector for the position and size of actors
class Vec {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  plus(other) {
    return new Vec(this.x + other.x, this.y + other.y);
  }
  // Scales the vector by the given factor
  times(factor) {
    return new Vec(this.x * factor, this.y * factor);
  }
}

class Player {
  constructor(pos, speed) {
    this.pos = pos;
    // The player's speed is a vector that simulates momentum and gravity
    this.speed = speed;
  }

  get type() {
    return "player";
  }

  /* The player is 1.5 squares high so its initial position is .5 squares above the position of @.
   * This way its bottom aligns with the bottom of the square where it appeared. */
  static create(pos) {
    return new Player(pos.plus(new Vec(0, -0.5)), new Vec(0, 0));
  }
}
// Size is the same for all players so it is stored on the prototype. Strings are not recreated when evaluated.
Player.prototype.size = new Vec(0.8, 1.5);

class Lava {
  constructor(pos, speed, reset) {
    this.pos = pos;
    this.speed = speed;
    this.reset = reset;
  }

  get type() {
    return "lava";
  }

  /* Lava is constructed differently based on the character. Dynamic lava moves along its current speed until
   * it collides with something. Then if it has a reset position it returns to that position (dripping).
   * Otherwise it bounces in the opposite direction. Create looks at the character and creates the appropriate actor. */
  static create(pos, ch) {
    if (ch == "=") {
      return new Lava(pos, new Vec(2, 0));
    } else if (ch == "|") {
      return new Lava(pos, new Vec(0, 2));
    } else if (ch == "v") {
      return new Lava(pos, new Vec(0, 3), pos);
    }
  }
}

Lava.prototype.size = new Vec(1, 1);

class Coin {
  /* Coins have a wobble: a slight vertical back-and-forth motion */
  constructor(pos, basePos, wobble) {
    this.pos = pos;
    this.basePos = basePos;
    this.wobble = wobble; // Tracks the phase of the wobble animation
  }

  get type() {
    return "coin";
  }

  static create(pos) {
    let basePos = pos.plus(new Vec(0.2, 0.1));
    // The starting phase of each coin is randomized. The period of Math.sin is 2 PI.
    return new Coin(basePos, basePos, Math.random() * Math.PI * 2);
  }
}

Coin.prototype.size = new Vec(0.6, 0.6);

// Define levelChars that maps plan characters to either background grid types or actor classes
const levelChars = {
  ".": "empty",
  "#": "wall",
  "+": "lava",
  "@": Player,
  o: Coin,
  "=": Lava,
  "|": Lava,
  v: Lava,
};

// Create the level object
let simpleLevel = new Level(simpleLevelPlan);
console.log(`${simpleLevel.width} by ${simpleLevel.height}`);
// → 22 by 9

// Succinct way to create an element and give it attributes and child nodes
function elt(name, attrs, ...children) {
  let dom = document.createElement(name);
  for (let attr of Object.keys(attrs)) {
    dom.setAttribute(attr, attrs[attr]);
  }
  for (let child of children) {
    dom.appendChild(child);
  }
  return dom;
}

// A display is created by giving it a parent element to which it should append itself and a level object
class DOMDisplay {
  constructor(parent, level) {
    this.dom = elt("div", { class: "game" }, drawGrid(level));
    this.actorLayer = null;
    parent.appendChild(this.dom);
  }

  clear() {
    this.dom.remove();
  }
}

// The scale constant gives the number of pixels that a single unit takes up on the screen
const scale = 20;

// Game grid is drawn as a table
function drawGrid(level) {
  return elt(
    "table",
    {
      class: "background",
      style: `width: ${level.width * scale}px`,
    },
    // Use ... to unpack the rows array into separate arguments
    ...level.rows.map((row) =>
      elt(
        "tr",
        { style: `height: ${scale}px` },
        ...row.map((type) => elt("td", { class: type }))
      )
    )
  );
}

/* Draw each actor by creating a DOM element for it and setting that element's
 * position and size based on the actor's properties. */
function drawActors(actors) {
  return elt(
    "div",
    {},
    ...actors.map((actor) => {
      let rect = elt("div", { class: `actor ${actor.type}` });
      // The values must be converted to pixels by multiplying by the scale constant.
      rect.style.width = `${actor.size.x * scale}px`;
      rect.style.height = `${actor.size.y * scale}px`;
      rect.style.left = `${actor.pos.x * scale}px`;
      rect.style.top = `${actor.pos.y * scale}px`;
      return rect;
    })
  );
}

/* The syncState method is used to make the display show a given state. */
DOMDisplay.prototype.syncState = function (state) {
  // Remove old actor graphics
  if (this.actorLayer) this.actorLayer.remove();
  // Redraw actors in their new position
  this.actorLayer = drawActors(state.actors);
  this.dom.appendChild(this.actorLayer);
  this.dom.className = `game ${state.status}`;
  this.scrollPlayerIntoView(state);
};

/* The scrollPlayerIntoView method is used to ensure that the player's
 * position is updated by wrapping the element's scroll position. */
DOMDisplay.prototype.scrollPlayerIntoView = function (state) {
  let width = this.dom.clientWidth;
  let height = this.dom.clientHeight;
  let margin = width / 3;

  // The viewport
  let left = this.dom.scrollLeft,
    right = left + width;
  let top = this.dom.scrollTop,
    bottom = top + height;
  let player = state.player;
  /* Shows how the methods on our Vec type allow computations with objects to be
   * relatively human readable. The actor's center is computed by adding its position
   * (upper-left corner) to its size divided by 2. Then multiply by scale to get pixels. */
  let center = player.pos.plus(player.size.times(0.5)).times(scale);
  /* Change the scroll position by manipulating the element's scrollLeft
   * and scrollTop properties when the player is too close to the edge.
   * These checks verify the player position is not outside of the allowed range.
   * The DOM will constrain nonsense scroll coordinates (i.e. scrollLeft < 0)
   * to acceptable values. Always scrolling to the center of the viewport would be jarring. */
  if (center.x < left + margin) {
    this.dom.scrollLeft = center.x - margin;
  } else if (center.x > right - margin) {
    this.dom.scrollLeft = center.x + margin - width;
  }
  if (center.y < top + margin) {
    this.dom.scrollTop = center.y - margin;
  } else if (center.y > bottom - margin) {
    this.dom.scrollTop = center.y + margin - height;
  }
};

/* Tells us whether a rectangle specified by its position and size
 * touches a grid element of the given type. */
Level.prototype.touches = function (pos, size, type) {
  // Compute the set of grid squares the body overlaps
  let xStart = Math.floor(pos.x);
  let xEnd = Math.ceil(pos.x + size.x);
  let yStart = Math.floor(pos.y);
  let yEnd = Math.ceil(pos.y + size.y);
  // Loop over the grid squares found by rounding the coordinates
  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      let isOutside = x < 0 || x >= this.width || y < 0 || y >= this.height;
      // Squares outside the level are treated as a wall to prevent going out of bounds
      let here = isOutside ? "wall" : this.rows[y][x];
      // Return true when a matching square is found
      if (here == type) return true;
      // Otherwise, continue to the next square
    }
  }
  return false;
};

/* State update uses touches to figure out whether the player is touching lava.
 * Takes a time step and data structure which tells it which keys are pressed. */
State.prototype.update = function (time, keys) {
  // Call update method on all actors producing an array of updated actors
  let actors = this.actors.map((actor) => actor.update(time, this, keys));
  let newState = new State(this.level, actors, this.status);
  // If game is already over no further processing is done
  if (newState.status != "playing") return newState;
  let player = newState.player;
  // Test whether player is touching background lava
  if (this.level.touches(player.pos, player.size, "lava")) {
    // Game is lost
    return new State(this.level, actors, "lost");
  }
  // Check whether the player has collided with any actors
  for (let actor of actors) {
    if (actor != player && overlap(actor, player)) {
      newState = actor.collide(newState);
    }
  }
  return newState;
};

/* Overlap between actors is detected with the overlap function.
 * It takes two actors and returns true if they overlap. */
function overlap(actor1, actor2) {
  return (
    actor1.pos.x + actor1.size.x > actor2.pos.x &&
    actor1.pos.x < actor2.pos.x + actor2.size.x &&
    actor1.pos.y + actor1.size.y > actor2.pos.y &&
    actor1.pos.y < actor2.pos.y + actor2.size.y
  );
}

/* If actors overlap its collide method gets a chance to update
 * the state. Touching a lava actor sets the game status to lost. */
Lava.prototype.collide = function (state) {
  return new State(state.level, state.actors, "lost");
};
// Coins vanish on touch and set the status to won when they are the last coin of the level
Coin.prototype.collide = function (state) {
  let filtered = state.actors.filter((a) => a != this);
  let status = state.status;
  if (!filtered.some((a) => a.type == "coin")) status = "won";
  return new State(state.level, filtered, status);
};

/* Actor objects' update methods take as arguments the time step,
 * the state object, and a keys object. Lava actor ignores keys. */
Lava.prototype.update = function (time, state) {
  // Compute the new position of the lava
  let newPos = this.pos.plus(this.speed.times(time));
  if (!state.level.touches(newPos, this.size, "wall")) {
    // No obstacle blocking the position, so update position
    return new Lava(newPos, this.speed, this.reset);
  } else if (this.reset) {
    // Dripping position is reset to jump back when it hits something
    return new Lava(this.reset, this.speed, this.reset);
  } else {
    // Bouncing lava inverts its speed to move in the oppose direction
    return new Lava(this.pos, this.speed.times(-1));
  }
};

/* Coins update method wobbles. They ignore collisions with the grid
 * since they simply wobble around in their own square */
const wobbleSpeed = 8,
  wobbleDist = 0.07;

Coin.prototype.update = function (time) {
  // Wobble is updated to track time since last update
  let wobble = this.wobble + time * wobbleSpeed;
  // Math.sin finds the new position on the wave
  let wobblePos = Math.sin(wobble) * wobbleDist;
  // Current position is coputed from its base position plus offset
  return new Coin(
    this.basePos.plus(new Vec(0, wobblePos)),
    this.basePos,
    wobble
  );
};

/* Player motion is handled spearately per axis. Hitting the floor
 * should not prevent horizontal motion and hitting a wall should
 * not stop falling or jumping motion. */
const playerXSpeed = 7;
const gravity = 30;
const jumpSpeed = 17;

Player.prototype.update = function (time, state, keys) {
  // Horizontal motion is computed based on the state of left and right keys
  let xSpeed = 0;
  if (keys.ArrowLeft) xSpeed -= playerXSpeed;
  if (keys.ArrowRight) xSpeed += playerXSpeed;
  let pos = this.pos;
  let movedX = pos.plus(new Vec(xSpeed * time, 0));
  if (!state.level.touches(movedX, this.size, "wall")) {
    // No wall blocking the position, so update position
    pos = movedX;
  }
  // Vertical motion has to simulate jumping and gravity
  let ySpeed = this.speed.y + time * gravity;
  let movedY = pos.plus(new Vec(0, ySpeed * time));
  if (!state.level.touches(movedY, this.size, "wall")) {
    // New position is not a wall, so update position
    pos = movedY;
  } else if (keys.ArrowUp && ySpeed > 0) {
    // Player hit something below. This causes a jump.
    ySpeed = -jumpSpeed;
  } else {
    // Bumped into something so speed is zero
    ySpeed = 0;
  }
  return new Player(pos, new Vec(xSpeed, ySpeed));
};

/* Do not want keys to take effect once per keypress. The effect
 * should stay active as long as they are held. Set up a key handler
 * that stores the current state of the left right and up arrow keys. */
function trackKeys(keys) {
  let down = Object.create(null);
  // Track looks at the event object's type propert to determine whether key state should be updated
  function track(event) {
    if (keys.includes(event.key)) {
      down[event.key] = event.type == "keydown";
      // Prevent the default action to stop scrolling in the page
      event.preventDefault();
    }
  }
  // The same event handler is used for both event types
  window.addEventListener("keydown", track);
  window.addEventListener("keyup", track);
  // Return an object that tracks the current position of these keys
  return down;
}
// Set up tracking for left, right, and up
const arrowKeys = trackKeys(["ArrowLeft", "ArrowRight", "ArrowUp"]);

/* Define a helper function that wraps a convenient interface that simply allows us to
 * call runAnimation, giving it a function that expects a time difference as an argument
 * and draws a single frame. When the frame function returns false the animation stops. */
function runAnimation(frameFunc) {
  let lastTime = null;
  function frame(time) {
    if (lastTime != null) {
      // Max frame step is one tenth of a second. The time interval is the time since the last frame
      let timeStep = Math.min(time - lastTime, 100) / 1000;
      // When the frame function returns false the animation stops
      if (frameFunc(timeStep) === false) return;
    }
    lastTime = time;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* This takes a Level object and a display constructor and returns a promise.
 * It displays the level in document.body and lets the user play through it.
 * When the level is finished, runLevel waits one more second to let the user
 * see the ending and then resolves the promise with the status of the game */
function runLevel(level, Display) {
  let display = new Display(document.body, level);
  let state = State.start(level);
  let ending = 1;
  return new Promise((resolve) => {
    runAnimation((time) => {
      state = state.update(time, arrowKeys);
      display.syncState(state);
      if (state.status == "playing") {
        return true;
      } else if (ending > 0) {
        ending -= time;
        return true;
      } else {
        display.clear();
        resolve(state.status);
        return false;
      }
    });
  });
}

/* A game is made up of levels. The start level is the first level in the game.
 * When a level is completed we move on to the next. This takes an array
 * of level plans as strings and a display constructor.
 * The game ends when the last level is reached.
 * The game can be written using an async function. It returns a promise
 * that resolves to the status of the game. */
async function runGame(plans, Display) {
  for (let level = 0; level < plans.length; ) {
    let status = await runLevel(new Level(plans[level]), Display);
    if (status == "won") level++;
  }
  console.log("You've won!");
}
