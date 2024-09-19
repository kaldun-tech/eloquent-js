// Create a regex
let re1 = new RegExp("abc");
let re2 = /abc/;
// Escape a plus
let aPlus = /A\+/;
// Test for matches
console.log(/abc/.test("abcde"));
// → true
console.log(/abc/.test("abxde"));
// → false

// Match strings containing a digit
console.log(/[0123456789]/.test("in 1992"));
// → true
console.log(/[0-9]/.test("in 1992"));
// → true

/* Shortcuts
\d	Any digit character
\w	An alphanumeric character (“word character”)
\s	Any whitespace character (space, tab, newline, and similar)
\D	A character that is not a digit
\W	A nonalphanumeric character
\S	A nonwhitespace character
.	Any character except for newline

Match a date and time format like 01-30-2003 15:20 */
let dateTime = /\d\d-\d\d-\d\d\d\d \d\d:\d\d/;
console.log(dateTime.test("01-30-2003 15:20"));
// → true
console.log(dateTime.test("30-jan-2003 15:20"));
// → false

// Invert a character set - express match except for in the set
let nonBinary = /[^01]/;
console.log(nonBinary.test("1100100010100110"));
// → false
console.log(nonBinary.test("0111010112101001"));
// → true

/* Handle international character sets with \p property groups
\p{L}	Any letter
\p{N}	Any numeric character
\p{P}	Any punctuation character
\P{L}	Any nonletter (uppercase P inverts)
\p{Script=Hangul}	Any character from the given script (see Chapter 5) */
console.log(/\p{L}/u.test("α"));
// → true
console.log(/\p{L}/u.test("!"));
// → false
console.log(/\p{Script=Greek}/u.test("α"));
// → true
console.log(/\p{Script=Arabic}/u.test("α"));
// → false

// Repeated patterns
console.log(/'\d+'/.test("'123'"));
// → true
console.log(/'\d+'/.test("''"));
// → false
console.log(/'\d*'/.test("'123'"));
// → true
console.log(/'\d*'/.test("''"));
// → true

// Optional patterns
let neighbor = /neighbou?r/;
console.log(neighbor.test("neighbour"));
// → true
console.log(neighbor.test("neighbor"));
// → true

// More readable dat-time with single and double digit days, months, and hours
dateTime = /\d{1,2}-\d{1,2}-\d{4} \d{1,2}:\d{2}/;
console.log(dateTime.test("1-30-2003 8:45"));
// → true

// Grouping subexpressions
let cartoonCrying = /boo+(hoo+)+/i;
console.log(cartoonCrying.test("Boohoooohoohooo"));
// → true

// exec method returns null if no match, else object with info about match
let match = /\d+/.exec("one two 100");
console.log(match);
// → ["100"]
console.log(match.index);
// → 8

// Strings have a match method similar to exec
console.log("one two 100".match(/\d+/));
// → ["100"]

/* When regex contains subexpressions grouped with parentheses, the text that matched those groups
will always show up in the array. The whole match is always the first element. The next element
is the part matched by the first group, then the second and so on. */
let quotedText = /'([^']*)'/;
console.log(quotedText.exec("she said 'hello'"));
// → ["'hello'", "hello"]

// When a group is ot matched its position in the output array will hold undefined.
// When a group is matched multiple times only the last match is kept.
console.log(/bad(ly)?/.exec("bad"));
// → ["bad", undefined]
console.log(/(\d)+/.exec("123"));
// → ["123", "3"]

// Use a parentheses purely for grouping without having them show up in the array of matches
console.log(/(?:na)+/.exec("banana"));
// → ["nana"]

// JS date class
console.log(new Date());
// → Fri Feb 02 2024 18:03:06 GMT+0100 (CET)

// Object for a specific time
console.log(new Date(2009, 11, 9));
// → Wed Dec 09 2009 00:00:00 GMT+0100 (CET)
console.log(new Date(2009, 11, 9, 12, 59, 59, 999));
// → Wed Dec 09 2009 12:59:59 GMT+0100 (CET)

// Millis since the epoch 1970
console.log(new Date(2013, 11, 19).getTime());
// → 1387407600000
console.log(new Date(1387407600000));
// → Thu Dec 19 2013 00:00:00 GMT+0100 (CET)

// Create a date object from a string
function getDate(string) {
  let [_, month, day, year] = /(\d{1,2})-(\d{1,2})-(\d{4})/.exec(string);
  return new Date(year, month - 1, day);
}
console.log(getDate("1-30-2003"));
// → Thu Jan 30 2003 00:00:00 GMT+0100 (CET)

// Look-ahead tests: provide pattern and make the match fail if the input doesn't match the pattern. Don't move the position forward.
console.log(/a(?=e)/.exec("braeburn"));
// → ["a"]
console.log(/a(?! )/.exec("a b"));
// → null

// Choice pattern
let animalCount = /\d+ (pig|cow|chicken)s?/;
console.log(animalCount.test("15 pigs"));
// → true
console.log(animalCount.test("15 pugs"));
// → false

// String replace
console.log("papa".replace("p", "m"));
// → mapa

// With regex
console.log("Borobudur".replace(/[ou]/, "a"));
// → Barobudur
console.log("Borobudur".replace(/[ou]/g, "a"));
// → Barabadar

// Swap firstname and lastname
console.log(
  "Liskov, Barbara\nMcCarthy, John\nMilner, Robin".replace(
    /(\p{L}+), (\p{L}+)/gu,
    "$2 $1"
  )
);
// → Barbara Liskov
//   John McCarthy
//   Robin Milner

// Pass a function as the second argument to replace. For each replacement the callback
// is called with the matched groups. Return value is inserted into the new string.
let stock = "1 lemon, 2 cabbages, and 101 eggs";
function minusOne(match, amount, unit) {
  amount = Number(amount) - 1;
  if (amount == 1) {
    // only one left, remove the 's'
    unit = unit.slice(0, unit.length - 1);
  } else if (amount == 0) {
    amount = "no";
  }
  return amount + " " + unit;
}
console.log(stock.replace(/(\d+) (\p{L}+)/gu, minusOne));
// → no lemon, 1 cabbage, and 100 eggs

// Greedy algorithm uses replace to remove all comments from JS code
function stripComments(code) {
  return code.replace(/\/\/.*|\/\*[^]*\*\//g, "");
}
console.log(stripComments("1 + /* 2 */3"));
// → 1 + 3
console.log(stripComments("x = 10;// ten!"));
// → x = 10;
console.log(stripComments("1 /* a */+/* b */ 1"));
// → 1  1

// Non-greedy: Consume one block comment and nothing wrong
function stripComments(code) {
  return code.replace(/\/\/.*|\/\*[^]*?\*\//g, "");
}
console.log(stripComments("1 /* a */+/* b */ 1"));
// → 1 + 1

// Dynamically create RegExp object
let name = "harry";
let regexp = new RegExp("(^|\\s)" + name + "($|\\s)", "gi");
console.log(regexp.test("Harry is a dodgy character."));
// → true

// Add backslashes to escape special characters
name = "dea+hl[]rd";
let escaped = name.replace(/[\\[.+*?(){|^$]/g, "\\$&");
regexp = new RegExp("(^|\\s)" + escaped + "($|\\s)", "gi");
let text = "This dea+hl[]rd guy is super annoying.";
console.log(regexp.test(text));
// → true

// String search returns first index on which expression is found or -1 when not found
console.log("  word".search(/\S/));
// → 2
console.log("    ".search(/\S/));
// → -1

// lastIndex controls where next match will start
let pattern = /y/g;
pattern.lastIndex = 3;
match = pattern.exec("xyzzy");
console.log(match.index);
// → 4
console.log(pattern.lastIndex);
// → 5

// Global and sticky options
let global = /abc/g;
console.log(global.exec("xyz abc"));
// → ["abc"]
let sticky = /abc/y;
console.log(sticky.exec("xyz abc"));
// → null

// lastIndex can cause problems when used for multiple exec calls. Can start at an index left over from previous call.
let digit = /\d/g;
console.log(digit.exec("here it is: 1"));
// → ["1"]
console.log(digit.exec("and now: 1"));
// → null

// Global object changes the way match method on strings works. Instead of returning an array similar to exec,
// match will find all matches of the pattern in the string and return an array of their capture groups.
console.log("Banana".match(/an/g));
// → ["an", "an"]

// Find all matches of a regex
let input = "A string with 3 numbers in it... 42 and 88.";
let matches = input.matchAll(/\d+/g);
for (let match of matches) {
  console.log("Found", match[0], "at", match.index);
}
// → Found 3 at 14
//   Found 42 at 33
//   Found 88 at 40

// Parse INI file
function parseINI(string) {
  // Start with an object to hold the top-level fields
  let result = {};
  let section = result;
  for (let line of string.split(/\r?\n/)) {
    let match;
    if ((match = line.match(/^(\w+)=(.*)$/))) {
      section[match[1]] = match[2];
    } else if ((match = line.match(/^\[(.*)\]$/))) {
      section = result[match[1]] = {};
    } else if (!/^\s*(;|$)/.test(line)) {
      throw new Error("Line '" + line + "' is not valid.");
    }
  }
  return result;
}

console.log(
  parseINI(`
  name=Vasilis
  [address]
  city=Tessaloniki`)
);
// → {name: "Vasilis", address: {city: "Tessaloniki"}}

// Standard operators work on code units not actual characters. Characters composed of two units behave strangely.
console.log(/🍎{3}/.test("🍎🍎🍎"));
// → false
console.log(/<.>/.test("<🌹>"));
// → false
console.log(/<.>/u.test("<🌹>"));
// → true

// Handle unicode
console.log(/🍎{3}/u.test("🍎🍎🍎"));
// → true
