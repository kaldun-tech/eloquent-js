import { reverse } from "./reverse.mjs";

// Defines a script that can be called from the command-line to reverse a string
// Index 2 holds the first actual command line argument
let argument = process.argv[2];

console.log(reverse(argument));
