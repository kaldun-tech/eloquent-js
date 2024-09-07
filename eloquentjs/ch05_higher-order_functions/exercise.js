/* Use the reduce method in combination with concat to flatten an
 * array of arrays into a single array that has all the elements of the original arrays */
let arrays = [[1, 2, 3], [4, 5], [6]];
function flatten(array) {
  return array.reduce((a, b) => a.concat(b));
}
console.log(flatten(arrays));
// → [1, 2, 3, 4, 5, 6]

/* Write a higher-order function loop that provides something like a for loop statement.
   It should take a value, a test function, an update function, and a body function.
   Each iteration, it should first run the test function on the current loop value and stop if that returns false.
   It should then call the body function, giving it the current value, and finally call the update function to
   create a new value and start over from the beginning.

   When defining the function, you can use a regular loop to do the actual looping. */
function loop(value, test, update, body) {
  while (test(value)) {
    body(value);
    value = update(value);
  }
}
loop(
  3,
  (n) => 0 < n,
  (n) => n - 1,
  console.log
);
// → 3
// → 2
// → 1

/*
Arrays also have an every method analogous to the some method.
This method returns true when the given function returns true for every element in the array.
In a way, some is a version of the || operator that acts on arrays, and every is like the && operator.

Implement every as a function that takes an array and a predicate function as parameters.
Write two versions, one using a loop and one using the some method.
*/
function every(array, test) {
  return every_some(array, test);
}

function every_loop(array, test) {
  for (let val of array) {
    if (!test(val)) {
      return false;
    }
  }
  return true;
}

function every_some(array, test) {
  return array.some((val) => test(val));
}

console.log(every([1, 3, 5], (n) => n < 10));
// → true
console.log(every([2, 4, 16], (n) => n < 10));
// → false
console.log(every([], (n) => n < 10));
// → true

/*
Write a function that computes the dominant writing direction in a string of text.
Remember that each script object has a direction property that can be
"ltr" (left to right), "rtl" (right to left), or "ttb" (top to bottom).

The dominant direction is the direction of a majority of the characters that have a script associated with them.
The characterScript and countBy functions defined earlier in the chapter are probably useful here.
*/

// Given a character code find the corresponding script
function characterScript(code) {
  for (let script of SCRIPTS) {
    if (
      script.ranges.some(([from, to]) => {
        return from <= code && code < to;
      })
    ) {
      return script;
    }
  }
  return null;
}

function countBy(items, groupName) {
  let counts = [];
  for (let item of items) {
    let name = groupName(item);
    let known = counts.find((c) => c.name == name);
    if (!known) {
      counts.push({ name, count: 1 });
    } else {
      known.count++;
    }
  }
  return counts;
}

function scriptDirection(script) {
  return script ? script.direction : "none";
}

function dominantDirection(text) {}

console.log(dominantDirection("Hello!"));
// → ltr
console.log(dominantDirection("Hey, مساء الخير"));
// → rtl
