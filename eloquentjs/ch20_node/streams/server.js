// Create a server that reads request bodies and streams back to the client as all upper-case
import { createServer } from "node:http";
createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  request.on("data", (chunk) => response.write(chunk.toString().toUpperCase()));
  request.on("end", () => response.end());
}).listen(8000);
