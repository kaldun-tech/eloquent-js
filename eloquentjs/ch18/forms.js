// The question is escaped when encoded
console.log(encodeURIComponent("Yes?"));
// → Yes%3F
console.log(decodeURIComponent("Yes%3F"));
// → Yes?

// Fetch interface for HTTP requests
fetch("example/data.txt").then((response) => {
  console.log(response.status);
  // → 200
  console.log(response.headers.get("Content-Type"));
  // → text/plain
});

// Get the actual content of a response using text method
fetch("example/data.txt")
  .then((resp) => resp.text())
  .then((text) => console.log(text));
// → This is the content of data.txt

// Try to delete example/data.txt
fetch("example/data.txt", { method: "DELETE" }).then((resp) => {
  console.log(resp.status);
  // → 405
});

// Instruct the server to return only part of a document with the Range header
fetch("example/data.txt", { headers: { Range: "bytes=8-19" } })
  .then((resp) => resp.text())
  .then(console.log);
// → the content

// Wrap a FileReader error event in a promise
function readFileText(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsText(file);
  });
}

// Store data in a way that survives page reloads using localStorage
localStorage.setItem("username", "marijn");
console.log(localStorage.getItem("username"));
// → marijn
localStorage.removeItem("username");
