// Convert between day names and numbers. It defines a constant that is not part of its interace and two functions that are. It has no dependencies.
const names = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function dayName(number) {
  return names[number];
}
export function dayNumber(name) {
  return names.indexOf(name);
}

// The export keyword indicates a binding is part of the modules interface. Other modules can import the binding.
import { dayName } from "./dayname.js";
let now = new Date();
console.log(`Today is ${dayName(now.getDay())}`);
// → Today is Monday

// Rename local imports
import { dayName as nomDeJour } from "./dayname.js";
console.log(nomDeJour(3));
// → Wednesday

// Default export for modules that export a single binding
export default ["Winter", "Spring", "Summer", "Autumn"];

// Import default by omitting the braces around the name of the import
import seasonNames from "./seasonname.js";

// Import all the bindings from a module at the same time using *
import * as dayName from "./dayname.js";
console.log(dayName.dayName(3));
// → Wednesday

// Import INI file parser from NPM
import { parse } from "ini";

console.log(parse("x = 10\ny = 20"));
// → {x: "10", y: "20"}

// Old pre-2015 modules
const weekDay = (function () {
  const names = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return {
    name(number) {
      return names[number];
    },
    number(name) {
      return names.indexOf(name);
    },
  };
})();

console.log(weekDay.name(weekDay.number("Sunday")));
// → Sunday

/* Provides a date-formatting function using NPM ordinal and date-names.
 * It exports formatDate which takes a Date object and a template string.
 * The template string may contain codes that direct the format such as YYYY for the full year.
 * The interface for ordinal is a single function whereas date-names exports an object. */
const ordinal = require("ordinal");
const { days, months } = require("date-names");

exports.formatDate = function (date, format) {
  return format.replace(/YYYY|M(MMM)?|Do?|dddd/g, (tag) => {
    if (tag == "YYYY") return date.getFullYear();
    if (tag == "M") return date.getMonth();
    if (tag == "MMMM") return months[date.getMonth()];
    if (tag == "D") return date.getDate();
    if (tag == "Do") return ordinal(date.getDate());
    if (tag == "dddd") return days[date.getDay()];
  });
};

// Use the module like this:
const { formatDate } = require("./format-date.js");

console.log(formatDate(new Date(2017, 9, 13), "dddd the Do"));
// → Friday the 13th

// Assume access to a readFile function that reads a file by name and gives us its content. Simplified require:
function require(name) {
  if (!(name in require.cache)) {
    let code = readFile(name);
    let exports = (require.cache[name] = {});
    let wrapper = Function("require, exports", code);
    wrapper(require, exports);
  }
  return require.cache[name];
}
require.cache = Object.create(null);

// findRoute from robot project using dijkstrajs
const { find_path } = require("dijkstrajs");

let graph = {};
for (let node of Object.keys(roadGraph)) {
  let edges = (graph[node] = {});
  for (let dest of roadGraph[node]) {
    edges[dest] = 1;
  }
}

console.log(find_path(graph, "Post Office", "Cabin"));
// → ["Post Office", "Alice's House", "Cabin"]
