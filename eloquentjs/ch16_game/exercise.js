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
const monsterSpeed = 4;

class Monster {
  constructor(pos) {
    this.pos = pos;
  }

  get type() {
    return "monster";
  }

  static create(pos) {
    return new Monster(pos.plus(new Vec(0, -1)));
  }

  update(time, state) {
    let player = state.player;
    let speed = (player.pos.x < this.pos.x ? -1 : 1) * time * monsterSpeed;
    let newPos = new Vec(this.pos.x + speed, this.pos.y);
    if (state.level.touches(newPos, this.size, "wall")) return this;
    else return new Monster(newPos);
  }

  collide(state) {
    let player = state.player;
    if (player.pos.y + player.size.y < this.pos.y + 0.5) {
      let filtered = state.actors.filter((a) => a != this);
      return new State(state.level, filtered, state.status);
    } else {
      return new State(state.level, state.actors, "lost");
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
