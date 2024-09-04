/*
Write a range function that takes two arguments, start and end, and returns an array containing all the numbers from start up to and including end.

Next, write a sum function that takes an array of numbers and returns the sum of these numbers.
Run the example program and see whether it does indeed return 55.

As a bonus assignment, modify your range function to take an optional third argument that indicates the “step” value used when building the array.
If no step is given, the elements should go up by increments of one, corresponding to the old behavior.
The function call range(1, 10, 2) should return [1, 3, 5, 7, 9].
Make sure this also works with negative step values so that range(5, 2, -1) produces [5, 4, 3, 2].
*/
function range(start, end, step = 1) {
  let arr = [];
  for (
    let i = start;
    (step < 0 && end <= i) || (0 < step && i <= end);
    i += step
  ) {
    arr.push(i);
  }
  return arr;
}

function sum(numbers) {
  let scalar = 0;
  for (let next of numbers) {
    scalar += next;
  }
  return scalar;
}
console.log(range(1, 10));
// → [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
console.log(range(5, 2, -1));
// → [5, 4, 3, 2]
console.log(sum(range(1, 10)));
// → 55
console.log(range(1, 10, 2));
// [1, 3, 5, 7, 9]

/*
Arrays have a reverse method that changes the array by inverting the order in which its elements appear.
For this exercise, write two functions, reverseArray and reverseArrayInPlace.
The first, reverseArray, should take an array as its argument and produce a new array that has the same elements in the inverse order.
The second, reverseArrayInPlace, should do what the reverse method does: modify the array given as its argument by reversing its elements.
Neither may use the standard reverse method.

Thinking back to the notes about side effects and pure functions in the previous chapter,
which variant do you expect to be useful in more situations? Which one runs faster?
*/
function reverseArray(array) {
  let reversed = [];
  for (let next of array) {
    reversed.unshift(next);
  }
  return reversed;
}

function reverseArrayInPlace(array) {
  for (let i = 0; i < array.length / 2; ++i) {
    let j = array.length - i - 1;
    [array[i], array[j]] = [array[j], array[i]];
  }
}

let myArray = ["A", "B", "C"];
console.log(myArray);
// → ["A", "B", "C"];
console.log(reverseArray(myArray));
// → ["C", "B", "A"];
let arrayValue = [1, 2, 3, 4, 5];
reverseArrayInPlace(arrayValue);
console.log(arrayValue);
// → [5, 4, 3, 2, 1]

/*
Write a function arrayToList that builds up a list structure like the one shown when given [1, 2, 3] as argument.
Also write a listToArray function that produces an array from a list.
Add the helper functions prepend, which takes an element and a list and creates a new list that adds the element
to the front of the input list, and nth, which takes a list and a number and returns the element at the given
position in the list (with zero referring to the first element) or undefined when there is no such element.

If you haven’t already, also write a recursive version of nth.
*/
function arrayToList(arr) {
  let list = null;
  for (let i = arr.length - 1; 0 <= i; --i) {
    list = prepend(arr[i], list);
  }
  return list;
}

function prepend(ele, list) {
  return {
    value: ele,
    rest: list,
  };
}

function listToArray(list) {
  let arr = [];
  for (let i = 0, n = 0; (n = nth(list, i)) != undefined; ++i) {
    arr.push(n);
  }
  return arr;
}

function nth(list, n) {
  let value = list?.value;
  if (value == undefined) {
    return undefined;
  } else if (n == 0) {
    return list.value;
  } else {
    return nth(list.rest, n - 1);
  }
}

console.log(arrayToList([10, 20]));
// → {value: 10, rest: {value: 20, rest: null}}
console.log(listToArray(arrayToList([10, 20, 30])));
// → [10, 20, 30]
console.log(prepend(10, prepend(20, null)));
// → {value: 10, rest: {value: 20, rest: null}}
console.log(nth(arrayToList([10, 20, 30]), 1));
// → 20

/*
The == operator compares objects by identity, but sometimes you’d prefer to compare the values of their actual properties.

Write a function deepEqual that takes two values and returns true only if they are the same value or are objects with the same properties,
where the values of the properties are equal when compared with a recursive call to deepEqual.

To find out whether values should be compared directly (using the === operator for that) or have their properties compared,
you can use the typeof operator. If it produces "object" for both values, you should do a deep comparison.
But you have to take one silly exception into account: because of a historical accident, typeof null also produces "object".

The Object.keys function will be useful when you need to go over the properties of objects to compare them.
*/
function deepEqual(a, b) {
  if (a === b) {
    return true;
  } else if (
    a != null &&
    typeof a == "object" &&
    b != null &&
    typeof b == "object"
  ) {
    return objectsEqual(a, b);
  }
  return false;
}
function objectsEqual(a, b) {
  let aKeys = Object.keys(a);
  let bKeys = Object.keys(b);
  if (aKeys.length == bKeys.length) {
    for (i = 0; i < aKeys.length; ++i) {
      if (!deepEqual(aKeys[i], bKeys[i])) {
        return false;
      }
    }
    return true;
  }
  return false;
}

let obj = { here: { is: "an" }, object: 2 };
console.log(deepEqual(obj, obj));
// → true
console.log(deepEqual(obj, { here: 1, object: 2 }));
// → false
console.log(deepEqual(obj, { here: { is: "an" }, object: 2 }));
// → true
