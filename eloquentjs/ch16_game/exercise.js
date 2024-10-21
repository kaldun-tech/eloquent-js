/* It’s traditional for platform games to have the player start with a limited number of lives
and subtract one life each time they die. When the player is out of lives, the game restarts from the beginning.

Adjust runGame to implement lives. Have the player start with three.
Output the current number of lives (using console.log) every time a level starts. */
async function runGame(plans, Display) {
  let lives = 3;
  for (let level = 0; level < plans.length && 0 < lives; ) {
    console.log(`Level ${level + 1}, lives: ${lives}`);
    let status = await runLevel(new Level(plans[level]), Display);
    if (status == "won") level++;
    else lives--;
  }
  if (lives > 0) {
    console.log("You've won!");
  } else {
    console.log("Game over");
  }
}
runGame(GAME_LEVELS, DOMDisplay);

/* Make it possible to pause (suspend) and unpause the game by pressing esc. You can do this by changing the runLevel
function to set up a keyboard event handler that interrupts or resumes the animation whenever esc is hit.

The runAnimation interface may not look like it is suitable for this at first glance,
but it is if you rearrange the way runLevel calls it.

When you have that working, there’s something else you can try. The way we’ve been registering keyboard event
handlers is somewhat problematic. The arrowKeys object is currently a global binding, and its event handlers are
kept around even when no game is running. You could say they leak out of our system. Extend trackKeys to provide
a way to unregister its handlers, then change runLevel to register its handlers when it starts and unregister
them again when it is finished. */

/* Do not want keys to take effect once per keypress. The effect
 * should stay active as long as they are held. Set up a key handler
 * that stores the current state of the left right and up arrow keys. */
function runLevel(level, Display) {
  let display = new Display(document.body, level);
  let state = State.start(level);
  let ending = 1;
  let running = "yes";

  return new Promise((resolve) => {
    function escHandler(event) {
      if (event.key != "Escape") return;
      event.preventDefault();
      if (running == "no") {
        running = "yes";
        runAnimation(frame);
      } else if (running == "yes") {
        running = "pausing";
      } else {
        running = "yes";
      }
    }
    window.addEventListener("keydown", escHandler);
    let arrowKeys = trackKeys(["ArrowLeft", "ArrowRight", "ArrowUp"]);

    function frame(time) {
      if (running == "pausing") {
        running = "no";
        return false;
      }

      state = state.update(time, arrowKeys);
      display.syncState(state);
      if (state.status == "playing") {
        return true;
      } else if (ending > 0) {
        ending -= time;
        return true;
      } else {
        display.clear();
        window.removeEventListener("keydown", escHandler);
        arrowKeys.unregister();
        resolve(state.status);
        return false;
      }
    }
    runAnimation(frame);
  });
}

function trackKeys(keys) {
  let down = Object.create(null);
  function track(event) {
    if (keys.includes(event.key)) {
      down[event.key] = event.type == "keydown";
      event.preventDefault();
    }
  }
  window.addEventListener("keydown", track);
  window.addEventListener("keyup", track);
  down.unregister = () => {
    window.removeEventListener("keydown", track);
    window.removeEventListener("keyup", track);
  };
  return down;
}

/* It is traditional for platform games to have enemies that you can defeat by jumping on top of them.
This exercise asks you to add such an actor type to the game.

We’ll call this actor a monster. Monsters move only horizontally. You can make them move in the
direction of the player, bounce back and forth like horizontal lava, or have any other movement pattern
you want. The class doesn’t have to handle falling, but it should make sure the monster doesn’t walk through walls.

When a monster touches the player, the effect depends on whether the player is jumping on top of them or not.
You can approximate this by checking whether the player’s bottom is near the monster’s top. If this is the case,
the monster disappears. If not, the game is lost. Complete the constructor, update, and collide methods.*/
class Monster {
  constructor(pos, speed, reset) {
    this.pos = pos;
    this.speed = speed;
    this.reset = reset;
    this.alive = true;
  }

  get type() {
    return "monster";
  }

  static create(pos) {
    return new Monster(pos.plus(new Vec(0, -1), new Vec(3, 0)));
  }

  update(time, state) {
    if (!this.alive) return;

    let newPos = this.pos.plus(this.speed.times(time));
    if (!state.level.touches(newPos, this.size, "wall")) {
      // No obstacle blocking the position, so update position
      return new Monster(newPos, this.speed, this.reset);
    } else if (this.reset) {
      // Reset position jumps back when it hits something
      return new Monster(this.reset, this.speed, this.reset);
    } else {
      // Monster inverts its speed to move in the oppose direction
      return new Monster(this.pos, this.speed.times(-1), this.reset);
    }
  }

  collide(state) {
    let player = state.player;
    if (player.pos.y + player.size.y < this.pos.y) {
      // Monster collided with the player
      return new State(state.level, state.actors, "lost");
    } else {
      // Player jumped on the monster
      if (this.reset) {
        // Reset the monster
        this.pos = this.reset;
      } else {
        // Kill and remove the monster
        this.alive = false;
        let filtered = state.actors.filter((a) => a != this);
        return new State(state.level, filtered, "playing");
      }
    }
  }
}

Monster.prototype.size = new Vec(1.2, 2);

levelChars["M"] = Monster;

runLevel(
  new Level(`
  ..................................
  .################################.
  .#..............................#.
  .#..............................#.
  .#..............................#.
  .#...........................o..#.
  .#..@...........................#.
  .##########..............########.
  ..........#..o..o..o..o..#........
  ..........#...........M..#........
  ..........################........
  ..................................
  `),
  DOMDisplay
);
