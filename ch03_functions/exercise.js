// Define a function min that takes two arguments and returns their minimum
function min(a, b) {
  // Consider undefined
  if (a <= b) {
    return a;
  } else {
    return b;
  }
}
console.log(min(0, 10));
// → 0
console.log(min(0, -10));
// → -10

function isEven(x) {
  if (x == 0) {
    return true;
  } else if (x == 1) {
    return false;
  } else if (x < 0) {
    return isEven(x + 2);
  } else {
    return isEven(x - 2);
  }
}
console.log(isEven(50));
// → true
console.log(isEven(75));
// → false
console.log(isEven(-1));
// → false

// Get the number of uppercase B's in a string
function countChar(str, char) {
  let count = 0;
  for (i = 0; i < str.length; ++i) {
    if (str[i] == char) {
      ++count;
    }
  }
  return count;
}
function countBs(str) {
  return countChar(str, "B");
}
console.log(countBs("BOB"));
// → 2
console.log(countChar("kakkerlak", "k"));
// → 4
