// Simple method
function speak(line) {
  console.log(`The ${this.type} rabbit says '${line}'`);
}
let whiteRabbit = { type: "white", speak };
let hungryRabbit = { type: "hungry", speak };

whiteRabbit.speak("Oh my fur and whiskers");
// → The white rabbit says 'Oh my fur and whiskers'
hungryRabbit.speak("Got any carrots?");
// → The hungry rabbit says 'Got any carrots?'

// Call
speak.call(whiteRabbit, "Hurry");
// → The white rabbit says 'Hurry'

// Reference this from inside a local function
let finder = {
  find(array) {
    return array.some((v) => v == this.value);
  },
  value: 5,
};
console.log(finder.find([4, 5]));
// → true

// Prototypes
let empty = {};
console.log(empty.toString);
// → function toString(){…}
console.log(empty.toString());
// → [object Object]
console.log(Object.getPrototypeOf({}) == Object.prototype);
// → true
console.log(Object.getPrototypeOf(Object.prototype));
// → null
console.log(Object.getPrototypeOf(Math.max) == Function.prototype);
// → true
console.log(Object.getPrototypeOf([]) == Array.prototype);
// → true

// Use Object.create to create an object with a specific prototype
let protoRabbit = {
  speak(line) {
    console.log(`The ${this.type} rabbit says '${line}'`);
  },
};
let blackRabbit = Object.create(protoRabbit);
blackRabbit.type = "black";
blackRabbit.speak("I am fear and darkness");
// → The black rabbit says 'I am fear and darkness'

// Constructor
function makeRabbit(type) {
  let rabbit = Object.create(protoRabbit);
  rabbit.type = type;
  return rabbit;
}

// Class
class Rabbit {
  constructor(type) {
    this.type = type;
  }
  speak(line) {
    console.log(`The ${this.type} rabbit says '${line}'`);
  }
}

// Declaration
let killerRabbit = new Rabbit("killer");

// Pre-2015 declaration
function ArchaicRabbit(type) {
  this.type = type;
}
ArchaicRabbit.prototype.speak = function (line) {
  console.log(`The ${this.type} rabbit says '${line}'`);
};
let oldSchoolRabbit = new ArchaicRabbit("old school");

// Prototype property holds prototype for created instances
console.log(Object.getPrototypeOf(Rabbit) == Function.prototype);
// → true
console.log(Object.getPrototypeOf(killerRabbit) == Rabbit.prototype);
// → true

// Constructor adds per-instance properties to this
class Particle {
  speed = 0;
  constructor(position) {
    this.position = position;
  }
}

// Omit the class name in a class expression
let object = new (class {
  getWord() {
    return "hello";
  }
})();
console.log(object.getWord());
// → hello

// Private property #getSecret
class SecretiveObject {
  #getSecret() {
    return "I ate all the plums";
  }
  interrogate() {
    let shallISayIt = this.#getSecret();
    return "never";
  }
}

/* This implements an applicance for getting a random whole number below a given maximum number
 * It has only one public property: getNumber */
class RandomSource {
  #max;
  constructor(max) {
    this.#max = max;
  }
  getNumber() {
    return Math.floor(Math.random() * this.#max);
  }
}

// Override derived property
Rabbit.prototype.teeth = "small";
console.log(killerRabbit.teeth);
// → small
killerRabbit.teeth = "long, sharp, and bloody";
console.log(killerRabbit.teeth);
// → long, sharp, and bloody
console.log(new Rabbit("basic").teeth);
// → small
console.log(Rabbit.prototype.teeth);
// → small

// Override toString
console.log(Array.prototype.toString == Object.prototype.toString);
// → false
console.log([1, 2].toString());
// → 1,2

// Prototype toString
console.log(Object.prototype.toString.call([1, 2]));
// → [object Array]

// Map
let ages = {
  Boris: 39,
  Liang: 22,
  Júlia: 62,
};

console.log(`Júlia is ${ages["Júlia"]}`);
// → Júlia is 62
console.log("Is Jack's age known?", "Jack" in ages);
// → Is Jack's age known? false
console.log("Is toString's age known?", "toString" in ages);
// → Is toString's age known? true

// Create object that does not derive from Object.prototype
console.log("toString" in Object.create(null));
// → false

// Map class
ages = new Map();
ages.set("Boris", 39);
ages.set("Liang", 22);
ages.set("Júlia", 62);

console.log(`Júlia is ${ages.get("Júlia")}`);
// → Júlia is 62
console.log("Is Jack's age known?", ages.has("Jack"));
// → Is Jack's age known? false
console.log(ages.has("toString"));
// → false

// Object.hasOwn ignores object prototype
console.log(Object.hasOwn({ x: 1 }, "x"));
// → true
console.log(Object.hasOwn({ x: 1 }, "toString"));
// → false

// Array interface
Array.prototype.forEach.call(
  {
    length: 2,
    0: "A",
    1: "B",
  },
  (elt) => console.log(elt)
);
// → A
// → B

// Getter
let varyingSize = {
  get size() {
    return Math.floor(Math.random() * 100);
  },
};

console.log(varyingSize.size);
// → 73
console.log(varyingSize.size);
// → 49

// Setters and static
class Temperature {
  constructor(celsius) {
    this.celsius = celsius;
  }
  get fahrenheit() {
    return this.celsius * 1.8 + 32;
  }
  set fahrenheit(value) {
    this.celsius = (value - 32) / 1.8;
  }

  static fromFahrenheit(value) {
    return new Temperature((value - 32) / 1.8);
  }
}

let temp = new Temperature(22);
console.log(temp.fahrenheit);
// → 71.6
temp.fahrenheit = 86;
console.log(temp.celsius);
// → 30

let boil = Temperature.fromFahrenheit(212);
console.log(boil.celsius);
// → 100

// Symbols
let sym = Symbol("name");
console.log(sym == Symbol("name"));
// → false
Rabbit.prototype[sym] = 55;
console.log(killerRabbit[sym]);
// → 55

// Multiple symbols share same name
const length = Symbol("length");
Array.prototype[length] = 0;

console.log([1, 2].length);
// → 2
console.log([1, 2][length]);
// → 0

// Square brackets evaluate to produce the symbol property name
let myTrip = {
  length: 2,
  0: "Lankwitz",
  1: "Babelsberg",
  [length]: 21500,
};
console.log(myTrip[length], myTrip.length);
// → 21500 2

// Iterator interface
let okIterator = "OK"[Symbol.iterator]();
console.log(okIterator.next());
// → {value: "O", done: false}
console.log(okIterator.next());
// → {value: "K", done: false}
console.log(okIterator.next());
// → {value: undefined, done: true}

// Linked list with iterable
class List {
  constructor(value, rest) {
    this.value = value;
    this.rest = rest;
  }

  get length() {
    return 1 + (this.rest ? this.rest.length : 0);
  }

  static fromArray(array) {
    let result = null;
    for (let i = array.length - 1; i >= 0; i--) {
      result = new this(array[i], result);
    }
    return result;
  }
}

// Separate class for iterator
class ListIterator {
  constructor(list) {
    this.list = list;
  }

  next() {
    if (this.list == null) {
      return { done: true };
    }
    let value = this.list.value;
    this.list = this.list.rest;
    return { value, done: false };
  }
}

// Set up iterable: usually done in class
List.prototype[Symbol.iterator] = function () {
  return new ListIterator(this);
};

// Iterate with a for/of
let list = List.fromArray([1, 2, 3]);
for (let element of list) {
  console.log(element);
}
// → 1
// → 2
// → 3

// ... syntax works with any iterable object
console.log([..."PCI"]);
// → ["P", "C", "I"]

// Inheritance
class LengthList extends List {
  #length;

  constructor(value, rest) {
    super(value, rest);
    this.#length = super.length;
  }

  get length() {
    return this.#length;
  }
}

console.log(LengthList.fromArray([1, 2, 3]).length);
// → 3

// Instanceof operator
console.log(new LengthList(1, null) instanceof LengthList);
// → true
console.log(new LengthList(2, null) instanceof List);
// → true
console.log(new List(3, null) instanceof LengthList);
// → false
console.log([1] instanceof Array);
// → true
