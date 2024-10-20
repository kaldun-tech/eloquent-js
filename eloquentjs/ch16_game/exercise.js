/* It’s traditional for platform games to have the player start with a limited number of lives
and subtract one life each time they die. When the player is out of lives, the game restarts from the beginning.

Adjust runGame to implement lives. Have the player start with three.
Output the current number of lives (using console.log) every time a level starts. */
async function runGame(plans, Display) {
  for (let level = 0; level < plans.length; ) {
    let status = await runLevel(new Level(plans[level]), Display);
    if (status == "won") level++;
  }
  console.log("You've won!");
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
