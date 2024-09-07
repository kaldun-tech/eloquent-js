// Abstract do something N times
function repeat(n, action) {
  for (let i = 0; i < n; i++) {
    action(i);
  }
}

repeat(3, console.log);
// → 0
// → 1
// → 2

let labels = [];
repeat(5, (i) => {
  labels.push(`Unit ${i + 1}`);
});
console.log(labels);
// → ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"]

// Function creates functions
function isGreaterThan(n) {
  return (m) => m > n;
}
let greaterThan10 = isGreaterThan(10);
console.log(greaterThan10(11));
// → true

// Changes functions
function noisy(f) {
  return (...args) => {
    console.log("calling with", args);
    let result = f(...args);
    console.log("called with", args, ", returned", result);
    return result;
  };
}
noisy(Math.min)(3, 2, 1);
// → calling with [3, 2, 1]
// → called with [3, 2, 1] , returned 1

// Creates other control flow
function unless(test, then) {
  if (!test) {
    then();
  }
}
function logUnlessOdd(n) {
  unless(n % 2 == 1, () => {
    console.log(n, "is even");
  });
}
repeat(3, (n) => {
  logUnlessOdd(n);
});
// → 0 is even
// → 2 is even

["A", "B"].forEach((l) => console.log(l));
// → A
// → B

// Pure function that filters out elements in an array that do not pass a test
function filter(array, test) {
  let passed = [];
  for (let element of array) {
    if (test(element)) {
      passed.push(element);
    }
  }
  return passed;
}
console.log(filter(SCRIPTS, (script) => script.living));
// → [{name: "Adlam", …}, …]
console.log(SCRIPTS.filter((s) => s.direction == "ttb"));
// → [{name: "Mongolian", …}, …]

// Mapping transformation
function map(array, transform) {
  let mapped = [];
  for (let element of array) {
    mapped.push(transform(element));
  }
  return mapped;
}
let rtlScripts = SCRIPTS.filter((s) => s.direction == "rtl");
console.log(map(rtlScripts, (s) => s.name));
// → ["Adlam", "Arabic", "Imperial Aramaic", …]

// Reduce or fold
function reduce(array, combine, start) {
  let current = start;
  for (let element of array) {
    current = combine(current, element);
  }
  return current;
}
console.log(reduce([1, 2, 3, 4], (a, b) => a + b, 0));
// → 10
// The standard array reduce allows to use the first element of the array as start argument
console.log([1, 2, 3, 4].reduce((a, b) => a + b));

// Reduce twice to  find the script with the most characters. Note use of destructuring
function characterCount(script) {
  return script.ranges.reduce((count, [from, to]) => {
    return count + (to - from);
  }, 0);
}
console.log(
  SCRIPTS.reduce((a, b) => {
    return characterCount(a) < characterCount(b) ? b : a;
  })
);
// → {name: "Han", …}

// Done without higher-order functions
let biggest = null;
for (let script of SCRIPTS) {
  if (biggest == null || characterCount(biggest) < characterCount(script)) {
    biggest = script;
  }
}
console.log(biggest);
// → {name: "Han", …}

// Compose: find the average year of origin for living and dead scripts in the dataset
function average(array) {
  return array.reduce((a, b) => a + b) / array.length;
}
console.log(
  Math.round(average(SCRIPTS.filter((s) => s.living).map((s) => s.year)))
);
// → 1165
console.log(
  Math.round(average(SCRIPTS.filter((s) => !s.living).map((s) => s.year)))
);
// → 204

// Written as loop: What is computed and how? Intermediate results are incoherent. Less memory cost but less portable.
let total = 0,
  count = 0;
for (let script of SCRIPTS) {
  if (script.living) {
    total += script.year;
    count += 1;
  }
}
console.log(Math.round(total / count));
// → 1165

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
console.log(characterScript(121));
// → {name: "Latin", …}

// Code units: charCodeAt gives you a code unit. codePointAt gives a full Unicode character.
// Two emoji characters, horse and shoe
let horseShoe = "🐴👟";
console.log(horseShoe.length);
// → 4
console.log(horseShoe[0]);
// → (Invalid half-character)
console.log(horseShoe.charCodeAt(0));
// → 55357 (Code of the half-character)
console.log(horseShoe.codePointAt(0));
// → 128052 (Actual code for horse emoji)
// For loop gives real characters
let roseDragon = "🌹🐉";
for (let char of roseDragon) {
  console.log(char);
}
// → 🌹
// → 🐉

/* Count the characters belonging to each script
   Expects: collection that can be looped over, and function that computes a group name for a given element
   Returns: an array of object, each of which names a group and tells the number of elements found in the group
   Uses the array method find which goes over the elements and returns the first one for which a condition returns true, else undefined.
 */
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
console.log(countBy([1, 2, 3, 4, 5], (n) => n > 2));
// → [{name: false, count: 2}, {name: true, count: 3}]

/* Which scripts are used in a piece of text?
   Counts the characters by name using characterScript, falling back to "none"
   The filter call drops the entry for "none"
   Comput epercentages using total number of characters per script with reduce, combines map with join
 */
function textScripts(text) {
  let scripts = countBy(text, (char) => {
    let script = characterScript(char.codePointAt(0));
    return script ? script.name : "none";
  }).filter(({ name }) => name != "none");

  let total = scripts.reduce((n, { count }) => n + count, 0);
  if (total == 0) return "No scripts found";

  return scripts
    .map(({ name, count }) => {
      return `${Math.round((count * 100) / total)}% ${name}`;
    })
    .join(", ");
}

console.log(textScripts('英国的狗说"woof", 俄罗斯的狗说"тяв"'));
// → 61% Han, 22% Latin, 17% Cyrillic
