// Callback after wait
import * as fs from "fs";
setTimeout(() => console.log("Tick"), 500);

// Read file from storage. Not part of standard JS
readTextFile("shopping_list.txt", (content) => {
  console.log(`Shopping List:\n${content}`);
});
// → Shopping List:
// → Peanut butter
// → Bananas

// Multiple async actions with CBs
function compareFiles(fileA, fileB, callback) {
  readTextFile(fileA, (contentA) => {
    readTextFile(fileB, (contentB) => {
      callback(contentA == contentB);
    });
  });
}

// Promise
let fifteen = Promise.resolve(15);
fifteen.then((value) => console.log(`Got ${value}`));
// → Got 15

// Promise based interface for readTextFile function
function textFile(filename) {
  return new Promise((resolve) => {
    readTextFile(filename, (text) => resolve(text));
  });
}

textFile("plans.txt").then(console.log);

// Asynchronous promise pipeline with chaining
function randomFile(listFile) {
  return (
    textFile(listFile)
      .then((content) => content.trim().split("\n"))
      .then((ls) => ls[Math.floor(Math.random() * ls.length)])
      // Only this step is actually asynchronous because it returns a promise
      .then((filename) => textFile(filename))
  );
}

// Wrapper for synchronous data transformation produces processed version of asynchronous result
function jsonFile(filename) {
  return textFile(filename).then(JSON.parse);
}

jsonFile("package.json").then(console.log);

// Convention: First argument is error, second is success
someAsyncFunction((error, value) => {
  if (error) handleError(error);
  else processValue(value);
});

// Second argument passed to Promise.then is the rejection handler
function textFile(filename) {
  return new Promise((resolve, reject) => {
    readTextFile(filename, (text, error) => {
      if (error) reject(error);
      else resolve(text);
    });
  });
}

// Promise chaining
new Promise((_, reject) => reject(new Error("Fail")))
  // This first then is not called because the promise is rejected
  .then((value) => console.log("Handler 1:", value))
  .catch((reason) => {
    console.log("Caught failure " + reason);
    return "nothing";
  })
  .then((value) => console.log("Handler 2:", value));
// → Caught failure Error: Fail
// → Handler 2: nothing

/* Carla is trying to hack into the network with joinWifi. A partially correct password
 * gives a different error message than fully incorrect. She exploits this to learn
 * the password length and then brute force the password. First wrap a promise
 * to automatically reject after it takes too much time to quickly move on if no response. */
function withTimeout(promise, time) {
  return new Promise((resolve, reject) => {
    promise.then(resolve, reject);
    setTimeout(() => reject("Timed out"), time);
  });
}

/* To find the full password the program needs to repeatedly look for the next digit. If authentication
 * succeeds we know we have found the correct passcode. If it immediately fails we know the digit was
 * wrong so try the next. If the request times out we have found another correct digit so continue.
 * We cannot wait for a promise inside a for loop so use recursion. On each call the function gets
 * the code as its known and the next digit to try. It  may return a finished code or call through to
 * itself to either start the next position or try with another digit. */
function crackPasscode(networkID) {
  function nextDigit(code, digit) {
    let newCode = code + digit;
    // The access point tends to respond to bad authentication within 20 millis so timeout at 50s to be safe
    return withTimeout(joinWifi(networkID, newCode), 50)
      .then(() => newCode)
      .catch((failure) => {
        if (failure == "Timed out") {
          return nextDigit(newCode, 0);
        } else if (digit < 9) {
          return nextDigit(code, digit + 1);
        } else {
          throw failure;
        }
      });
  }
  return nextDigit("", 0);
}

/* Async function provides pseudosynchronous code to describe async computation.
 * This clearly shows the double loop structure of the function. */
async function crackPasscode(networkID) {
  for (let code = ""; ; ) {
    for (let digit = 0; ; digit++) {
      let newCode = code + digit;
      try {
        await withTimeout(joinWifi(networkID, newCode), 50);
        return newCode;
      } catch (failure) {
        if (failure == "Timed out") {
          code = newCode;
          break;
        } else if (digit == 9) {
          throw failure;
        }
      }
    }
  }
}

/* Generator function* returns an iterator. The function is frozen at its start.
 * Each time you call next on the iterator the function runs until it hits a yield expression.
 * This pauses it and causes the yielded value to become the next value produced by the iterator. */
function* powers(n) {
  for (let current = n; ; current *= n) {
    yield current;
  }
}

for (let power of powers(3)) {
  if (power > 50) break;
  console.log(power);
}
// → 3
// → 9
// → 27

/* Iterator for Group class from chapter 6. No need to create an object to hold the iteration state. */
Group.prototype[Symbol.iterator] = function* () {
  for (let i = 0; i < this.members.length; i++) {
    yield this.members[i];
  }
};

/* IP addresses queried using simplified dummy function called request for network communication.
 * This takes two arguments: network address and a message as JSON. It returns a promise that
 * either resolves to a response from the machine at the given address or rejects for a problem.
 * You can send commands on the device with a JSON message. This code sends a display update message
 * to all addresses on the local network to see what sticks. Each number in IP address ranges [0, 255] */
for (let addr = 1; addr < 256; addr++) {
  let data = [];
  for (let n = 0; n < 1500; n++) {
    data.push(n < addr ? 3 : 0);
  }
  let ip = `10.0.0.${addr}`;
  request(ip, { command: "display", data })
    .then(() => console.log(`Request to ${ip} accepted`))
    // Most addresses don't exist so catch prevents network errors from crashing the program
    .catch(() => {});
}

// Found local network addresses of devices
const screenAddresses = [
  "10.0.0.44",
  "10.0.0.45",
  "10.0.0.41",
  "10.0.0.31",
  "10.0.0.40",
  "10.0.0.42",
  "10.0.0.48",
  "10.0.0.47",
  "10.0.0.46",
];

/* Display a video clip on each screen resized appropriately. Use the clipImages variable to
 * hold an array of frames where each frame is represented with an array of nine sets of pixels.
 * Send a request to all of the screens at once. Also wait for the result of these requests to
 * not send the next frame before the current one has been sent and to notice when requests fail. */
function displayFrame(frame) {
  return Promise.all(
    // Maps over the images in frame which is an array of display data arrays to create an array of request promises
    frame.map((data, i) => {
      // Return a promise that combines all of these
      return request(screenAddresses[i], {
        command: "display",
        data,
      });
    })
  );
}

/* To stop playing a video, that process is wrapped in a class. The class has an asynchronous play method
 * that returns a promise that resolves only when playback is stopped again via the stop method.
 * The wait method wraps setTimeout to return a promise that resolves after the given time. */
function wait(time) {
  return new Promise((accept) => setTimeout(accept, time));
}

class VideoPlayer {
  constructor(frames, frameTime) {
    this.frames = frames;
    this.frameTime = frameTime;
    this.stopped = true;
  }

  async play() {
    this.stopped = false;
    for (let i = 0; !this.stopped; i++) {
      let nextFrame = wait(this.frameTime);
      await displayFrame(this.frames[i % this.frames.length]);
      await nextFrame;
    }
  }

  stop() {
    this.stopped = true;
  }
}

let video = new VideoPlayer(clipImages, 100);
video.play().catch((e) => {
  console.log("Playback failed: " + e);
});
setTimeout(() => video.stop(), 15000);

// Async behavior happens on its own empty function call stack
try {
  setTimeout(() => {
    throw new Error("Woosh");
  }, 20);
} catch (e) {
  // This will not run
  console.log("Caught", e);
}

// Sets a timeout but dallies until after the timeouts intended time so the timeout is late
let start = Date.now();
setTimeout(() => {
  console.log("Timeout ran at", Date.now() - start);
}, 20);
while (Date.now() < start + 50) {}
console.log("Wasted time until", Date.now() - start);
// → Wasted time until 50
// → Timeout ran at 55

/* Promises always resolve or reject as a new event. Even when a promise is already resolved
 * waiting will cause the callback to run after the current event loop. */
Promise.resolve("Done").then(console.log);
console.log("Me first!");
// → Me first!
// → Done

/* Gaps in execution: function tries to resport the size of each file in an array.
 * Read all of them at the same time rather than in sequence. This is broken:
 * It will always return only a single line of output of the file that took longest to read. */
async function fileSizes(files) {
  let list = "";
  await Promise.all(
    // Arrow functions can be made async
    files.map(async (fileName) => {
      /* Problem lies in the += operator which takes the current value of list at the start
       * time then sets the list binding to that value plus the added string */
      list += fileName + ": " + (await textFile(fileName)).length + "\n";
    })
  );
  return list;
}

fileSizes(["plans.txt", "shopping_list.txt"]).then(console.log);

/* To fix the problem above use a let binding to hold the accumulated list string
 * and return it after the loop finishes. */
async function fileSizes(files) {
  let lines = files.map(async (fileName) => {
    return fileName + ": " + (await textFile(fileName)).length;
  });
  return (await Promise.all(lines)).join("\n");
}
