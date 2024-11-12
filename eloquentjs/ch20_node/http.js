// Run an HTTP server: node http.js
import { createServer } from "node:http";
let server = createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(`
    <h1>Hello!</h1>
    <p>You asked for <code>${request.url}</code></p>`);
  response.end();
});
const port = process.env.PORT || 8000;
server.listen(port);
console.log(`Listening on http://localhost:${port}`);
