// Store a timer
let bombTimer = setTimeout(() => {
  console.log("BOOM!");
}, 500);
// Clear the timer sometimes
if (Math.random() < 0.5) {
  // 50% chance
  console.log("Defused.");
  clearTimeout(bombTimer);
}

// Set timers that should repeat every X milliseconds
let ticks = 0;
let clock = setInterval(() => {
  console.log("tick", ticks++);
  if (ticks == 10) {
    clearInterval(clock);
    console.log("stop.");
  }
}, 200);
