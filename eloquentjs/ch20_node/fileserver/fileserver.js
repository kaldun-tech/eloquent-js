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

// Exercises

/* 1. Search Tool:
On Unix systems, there is a command line tool called grep that can be used to quickly search files for a regular expression.

Write a Node script that can be run from the command line and acts somewhat like grep. It treats its first command line
argument as a regular expression and treats any further arguments as files to search. It outputs the names of any file whose
content matches the regular expression.

When that works, extend it so that when one of the arguments is a directory, it searches through all files in that directory
and its subdirectories.

Use asynchronous or synchronous filesystem functions as you see fit. Setting things up so that multiple asynchronous
actions are requested at the same time might speed things up a little, but not a huge amount, since most filesystems can
read only one thing at a time. */

// Returns array of files with content matching regex in a directory
function findFilesMatchingRegexInDirectory(directory, regex) {
  let files = [];
  for (let file of fs.readdirSync(directory)) {
    let path = directory + "/" + file;
    if (fs.statSync(path).isDirectory()) {
      // Recursive call on subdirectory
      files.push(...findFilesMatchingRegexInDirectory(path, regex));
    } else if (
      fs.statSync(path).isFile() &&
      doesFileContentsMatchRegex(file, regex)
    ) {
      files.push(path);
    }
  }
  return files;
}

// Returns true if file contents matches regex
function doesFileContentsMatchRegex(file, regex) {
  return fs.readFileSync(file, "utf8").match(regex);
}

let regex = process.argv[2];
let fileArgs = process.argv.slice(3);
let matchingFiles = [];
for (let nextFile of fileArgs) {
  if (fs.statSync(nextFile).isDirectory()) {
    matchingFiles.push(...findFilesMatchingRegexInDirectory(nextFile, regex));
  } else if (
    fs.statSync(nextFile).isFile() &&
    doesFileContentsMatchRegex(nextFile, regex)
  ) {
    matchingFiles.push(nextFile);
  }
}

/* 2. Directory Creation
Though the DELETE method in our file server is able to delete directories (using rmdir), the server currently does not
provide any way to create a directory.

Add support for the MKCOL method (“make collection”), which should create a directory by calling mkdir from the
node:fs module. MKCOL is not a widely used HTTP method, but it does exist for this same purpose in the WebDAV standard,
which specifies a set of conventions on top of HTTP that make it suitable for creating documents. */

import { mkdir } from "node:fs/promises";

async function createDirectory(path) {
  await mkdir(path);
}

// Asynchronous version of the MKCOL method to make a collection
methods.MKCOL = async function (request) {
  let path = urlPath(request.url);
  let stats;
  try {
    stats = await stat(path);
    // If the file exists and is a directory return 204 no content
    if (stats.isDirectory()) return { status: 204 };
    // If the file exists and is not a directory throw a 400 bad request
    else if (stats.isFile()) return { status: 400 };
  } catch (error) {
    // Create the directory
    createDirectory(path);
    return { status: 200 };
  }
};

/* 3. A Web Server
Since the file server serves up any kind of file and even includes the right Content-Type header, you can use it to
serve a website. Given that this server allows everybody to delete and replace files, this would make for an interesting
kind of website: one that can be modified, improved, and vandalized by everybody who takes the time to make the right HTTP request.

Write a basic HTML page that includes a simple JavaScript file. Put the files in a directory served by the file server
and open them in your browser.

Next, as an advanced exercise or even a weekend project, combine all the knowledge you gained from this book to build
a more user-friendly interface for modifying the website—from inside the website.

Use an HTML form to edit the content of the files that make up the website, allowing the user to update them on the
server by using HTTP requests, as described in Chapter 18.

Start by making only a single file editable. Then make it so that the user can select which file to edit. Use the fact
that our file server returns lists of files when reading a directory.

Don’t work directly in the code exposed by the file server, since if you make a mistake, you are likely to damage the
files there. Instead, keep your work outside of the publicly accessible directory and copy it there when testing.
*/
