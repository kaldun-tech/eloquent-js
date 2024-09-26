// Callback after wait
import * as fs from "fs";
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
