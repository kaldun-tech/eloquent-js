/*
You can enter your expression into an onlinetool like debuggex.com

Regexp golf
Code golf is a term used for the game of trying to express a particular program in as few characters as possible.
Similarly, regexp golf is the practice of writing as tiny a regular expression as possible to match a given pattern and only that pattern.

For each of the following items, write a regular expression to test whether the given pattern occurs in a string.
The regular expression should match only strings containing the pattern.
When your expression works, see whether you can make it any smaller.
*/

// car and cat
verify(/ca[rt]/, ["my car", "bad cats"], ["camper", "high art"]);
// pop and prop
verify(/pr?op/, ["pop culture", "mad props"], ["plop", "prrrop"]);
// ferret, ferry, and ferrari
verify(
  /ferr(et|y|ari)/,
  ["ferret", "ferry", "ferrari"],
  ["ferrum", "transfer A"]
);
// Any word ending in ious
verify(
  /ious($|\P{L})/u,
  ["how delicious", "spacious room"],
  ["ruinous", "consciousness"]
);
// A whitespace character followed by a period, comma, colon, or semicolon
verify(/\s[.,:;]/, ["bad punctuation ."], ["escape the period"]);
// A word longer than six letters
verify(
  /\p{L}{7}/u,
  ["Siebentausenddreihundertzweiundzwanzig"],
  ["no", "three small words"]
);
// A word without the letter e (or E)
verify(
  /(^|\P{L})[^\P{L}e]+($|\P{L})/iu,
  ["red platypus", "wobbling nest"],
  ["earth bed", "bedrøvet abe", "BEET"]
);

function verify(regexp, yes, no) {
  // Ignore unfinished exercises
  if (regexp.source == "...") return;
  for (let str of yes)
    if (!regexp.test(str)) {
      console.log(`Failure to match '${str}'`);
    }
  for (let str of no)
    if (regexp.test(str)) {
      console.log(`Unexpected match for '${str}'`);
    }
}

/* Quoting style
Imagine you have written a story and used single quotation marks throughout to mark pieces of dialogue.
Now you want to replace all the dialogue quotes with double quotes,
while keeping the single quotes used in contractions like aren’t.

Think of a pattern that distinguishes these two kinds of quote usage and craft a call to the replace method that does the proper replacement. */
let text = "'I'm the cook,' he said, 'it's my job.'";
// Change this call.
console.log(text.replace(/\'/g, '"'));
// → "I'm the cook," he said, "it's my job."

/* Numbers again
Write an expression that matches only JavaScript-style numbers. It must support an optional minus or plus sign in front of the number,
the decimal dot, and exponent notation — 5e-3 or 1E10 — again with an optional sign in front of the exponent.
Also note that it is not necessary for there to be digits in front of or after the dot, but the number cannot be a dot alone.
That is, .5 and 5. are valid JavaScript numbers, but a lone dot isn’t.
*/
// Fill in this regular expression.
//
let number = /^([\-\+]?(\d+\.?\d*|\d*\.\d+)|(\d+\.?\d*[eE][\-\+]?\d+))$/;

// Tests:
for (let str of [
  "1",
  "-1",
  "+15",
  "1.55",
  ".5",
  "5.",
  "1.3e2",
  "1E-4",
  "1e+12",
]) {
  if (!number.test(str)) {
    console.log(`Failed to match '${str}'`);
  }
}
for (let str of ["1a", "+-1", "1.2.3", "1+1", "1e4.5", ".5.", "1f5", "."]) {
  if (number.test(str)) {
    console.log(`Incorrectly accepted '${str}'`);
  }
}
