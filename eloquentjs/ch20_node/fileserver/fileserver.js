import { createServer } from "node:http";

const methods = Object.create(null);

createServer((request, response) => {
  let handler = methods[request.method] || notAllowed;
  handler(request)
    .catch((error) => {
      if (error.status != null) return error;
      return { body: String(error), status: 500 };
    })
    .then(({ body, status = 200, type = "text/plain" }) => {
      response.writeHead(status, { "Content-Type": type });
      if (body?.pipe) body.pipe(response);
      else response.end(body);
    });
}).listen(8000);

async function notAllowed(request) {
  return {
    status: 405,
    body: `Method ${request.method} not allowed.`,
  };
}

// Figure out which file path corresponds to a request URL
import { resolve, sep } from "node:path";

const baseDirectory = process.cwd();

function urlPath(url) {
  let { pathname } = new URL(url, "http://d");
  let path = resolve(decodeURIComponent(pathname).slice(1));
  if (path != baseDirectory && !path.startsWith(baseDirectory + sep)) {
    throw { status: 403, body: "Forbidden" };
  }
  return path;
}

import { createReadStream } from "node:fs";
import { stat, readdir } from "node:fs/promises";
import { lookup } from "mime-types";

// Return a list of files when reading a directory. Return the file's content for a regular file.
methods.GET = async function (request) {
  let path = urlPath(request.url);
  let stats;
  try {
    // Look up information about a file to find if it exists and is a directory
    stats = await stat(path);
  } catch (error) {
    // If the file doesn't exist throw a 404
    if (error.code != "ENOENT") throw error;
    else return { status: 404, body: "File not found" };
  }
  if (stats.isDirectory()) {
    return { body: (await readdir(path)).join("\n") };
  } else {
    return { body: createReadStream(path), type: lookup(path) };
  }
};

// Handle DELETE requests: slightly simpler
import { rmdir, unlink } from "node:fs/promises";

methods.DELETE = async function (request) {
  let path = urlPath(request.url);
  let stats;
  try {
    stats = await stat(path);
  } catch (error) {
    // If the file doesn't exist throw a 204 no content
    if (error.code != "ENOENT") throw error;
    else return { status: 204 };
  }
  if (stats.isDirectory()) await rmdir(path);
  else await unlink(path);
  return { status: 204 };
};

// Handle PUT requests
import { createWriteStream } from "node:fs";
// Wrap a readable stream in a promise
function pipeStream(from, to) {
  return new Promise((resolve, reject) => {
    from.on("error", reject);
    to.on("error", reject);
    to.on("finish", resolve);
    from.pipe(to);
  });
}

methods.PUT = async function (request) {
  let path = urlPath(request.url);
  await pipeStream(request, createWriteStream(path));
  return { status: 204 };
};
