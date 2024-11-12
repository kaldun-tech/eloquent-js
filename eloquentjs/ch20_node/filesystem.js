import { readFile } from "node:fs";
// Read a text file
readFile("file.txt", "utf8", (error, text) => {
  if (error) throw error;
  console.log("The file contains:", text);
});

// Read a binary file
readFile("file.txt", (error, buffer) => {
  if (error) throw error;
  console.log(
    "The file contained",
    buffer.length,
    "bytes.",
    "The first byte is:",
    buffer[0]
  );
});

// Write a text file
import { writeFile } from "node:fs";
writeFile("graffiti.txt", "Node was here", (err) => {
  if (err) console.log(`Failed to write file: ${err}`);
  else console.log("File written.");
});

// Read file with promise
import { readFile } from "node:fs/promises";
readFile("file.txt", "utf8").then((text) =>
  console.log("The file contains:", text)
);

// Read file synchronously
import { readFileSync } from "node:fs";
console.log("The file contains:", readFileSync("file.txt", "utf8"));
