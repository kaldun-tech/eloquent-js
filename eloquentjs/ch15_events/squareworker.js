/* Imagine that squaring a number is a heavy workload computation that we want to perform
 * in a separate thread. This responds to messages by computing a square and sending
 * back a message. */
addEventListener("message", (event) => {
  postMessage(event.data * event.data);
});

// Spawns a worker running that script, sends it a few messages, and outputs the responses
let squareWorker = new Worker("code/squareworker.js");
squareWorker.addEventListener("message", (event) => {
  console.log("The worker responded:", event.data);
});
squareWorker.postMessage(10);
squareWorker.postMessage(24);
