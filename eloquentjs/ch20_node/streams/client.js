// When run with the uppercasing server active, send a request to that server and write out the response it gets
fetch("http://localhost:8000/", {
  method: "POST",
  body: "Hello server",
})
  .then((resp) => resp.text())
  .then(console.log);
// → HELLO SERVER
