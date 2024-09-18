function canYouSpotTheProblem() {
  "use strict";
  // Original code forgot let in the binding
  for (let counter = 0; counter < 10; counter++) {
    console.log("Happy happy");
  }
}

canYouSpotTheProblem();
// → ReferenceError: counter is not defined

function Person(name) {
  this.name = name;
}
let ferdinand = Person("Ferdinand"); // oops
console.log(name);
// → Ferdinand

("use strict");
function Person(name) {
  this.name = name;
}
ferdinand = Person("Ferdinand"); // forgot new
// → TypeError: Cannot set property 'name' of undefined

// (graph: Object, from: string, to: string) => string[]
function findRoute(graph, from, to) {
  // ...
}

// Testing time
function test(label, body) {
  if (!body()) console.log(`Failed: ${label}`);
}

test("convert Latin text to uppercase", () => {
  return "hello".toUpperCase() == "HELLO";
});
test("convert Greek text to uppercase", () => {
  return "Χαίρετε".toUpperCase() == "ΧΑΊΡΕΤΕ";
});
test("don't convert case-less characters", () => {
  return "مرحبا".toUpperCase() == "مرحبا";
});

/* Tries to convert a whole number to a string in a given base (decimal, binary, etc.)
 * by repeatedly picking out the last digit then dividing to get rid of the digit.
 * The strange output indicates a bug */
function numberToString(n, base = 10) {
  let result = "",
    sign = "";
  if (n < 0) {
    sign = "-";
    n = -n;
  }
  do {
    result = String(n % base) + result;
    // Incorrect floating point division: n /= base;
    n = Math.floor(n / base);
  } while (n > 0);
  return sign + result;
}
console.log(numberToString(13, 10));
// → 1.5e-3231.3e-3221.3e-3211.3e-3201.3e-3191.3e-3181.3…

// What happens for a bad input? Special output like null can be OK
function promptNumber(question) {
  let result = Number(prompt(question));
  if (Number.isNaN(result)) return null;
  else return result;
}

console.log(promptNumber("How many trees do you see?"));

// Special returns get awkward though
function lastElement(array) {
  if (array.length == 0) {
    return { failed: true };
  } else {
    return { value: array[array.length - 1] };
  }
}

// Exception handling
function promptDirection(question) {
  let result = prompt(question);
  if (result.toLowerCase() == "left") return "L";
  if (result.toLowerCase() == "right") return "R";
  throw new Error("Invalid direction: " + result);
}

function look() {
  if (promptDirection("Which way?") == "L") {
    return "a house";
  } else {
    return "two angry bears";
  }
}

try {
  console.log("You see", look());
} catch (error) {
  console.log("Something went wrong: " + error);
}

// Bad code
const accounts = {
  a: 100,
  b: 0,
  c: 20,
};

function getAccount() {
  let accountName = prompt("Enter an account name");
  if (!Object.hasOwn(accounts, accountName)) {
    throw new Error(`No such account: ${accountName}`);
  }
  return accountName;
}

// Transfers a sum of money from a given account to the current account
function transfer(from, amount) {
  if (accounts[from] < amount) return;
  // Problem: will subtract if the account doesn't exist
  accounts[from] -= amount;
  accounts[getAccount()] += amount;
}

// Better transfer: tracks its progress and rolls back if it fails
function transfer(from, amount) {
  if (accounts[from] < amount) return;
  let progress = 0;
  try {
    accounts[from] -= amount;
    progress = 1;
    accounts[getAccount()] += amount;
    progress = 2;
  } finally {
    if (progress != 2) {
      // Problem: will roll back if the account doesn't exist
      accounts[from] += amount;
    }
  }
}

// Attempts to keep calling promptDirection until it gets a valid answer -> infinite loop
for (;;) {
  try {
    let dir = promtDirection("Where?"); // ← typo!
    console.log("You chose ", dir);
    break;
  } catch (e) {
    console.log("Not a valid direction. Try again.");
  }
}

// Throw specific exceptions
class InputError extends Error {}

function promptDirection(question) {
  let result = prompt(question);
  if (result.toLowerCase() == "left") return "L";
  if (result.toLowerCase() == "right") return "R";
  throw new InputError("Invalid direction: " + result);
}

// The updated loop catches the specific error
for (;;) {
  try {
    let dir = promptDirection("Where?");
    console.log("You chose ", dir);
    break;
  } catch (e) {
    if (e instanceof InputError) {
      console.log("Not a valid direction. Try again.");
    } else {
      throw e;
    }
  }
}

// Assertion for silly mistakes
function firstElement(array) {
  if (array.length == 0) {
    throw new Error("firstElement called with []");
  }
  return array[0];
}
