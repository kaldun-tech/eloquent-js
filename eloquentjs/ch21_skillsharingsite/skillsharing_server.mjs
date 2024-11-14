import { createServer } from "node:http";
import serveStatic from "serve-static";

function notFound(request, response) {
  response.writeHead(404, "Not found");
  response.end("<h1>Not found</h1>");
}

class SkillShareServer {
  constructor(talks) {
    this.talks = talks;
    this.version = 0;
    this.waiting = [];

    // Serve static files
    let fileServer = serveStatic("./public");
    this.server = createServer((request, response) => {
      // Delegate to router
      serveFromRouter(this, request, response, () => {
        // Called if no file matches the request
        fileServer(request, response, () => notFound(request, response));
      });
    });
  }
  start(port) {
    this.server.listen(port);
  }
  stop() {
    // Close the server
    this.server.close();
  }
}

// Logic to save and load data
const fs = require("fs");
const dataFile = "./data/talks.json";

// Load data from file when server starts
function loadData() {
  try {
    return JSON.parse(readFileSync(dataFile, "utf8"));
  } catch (e) {
    return {};
  }
}

// Save data to file
function saveData(data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(dataFile, JSON.stringify(this.talks), (e) => {
      if (e) throw e;
    });
  });
}

import { Router } from "./router.mjs";

const router = new Router();
const defaultHeaders = { "Content-Type": "text/plain" };

// Similar convention to the file server: handlers in the router return promises that resolve to objects describing the response
async function serveFromRouter(server, request, response, next) {
  let resolved = await router.resolve(request, server).catch((error) => {
    if (error.status != null) return error;
    return { body: String(err), status: 500 };
  });
  if (!resolved) return next();
  let { body, status = 200, headers = defaultHeaders } = await resolved;
  response.writeHead(status, headers);
  response.end(body);
}

const talkPath = /^\/talks\/([^\/]+)$/;

// Definition for a talk
class Talk {
  constructor(title, summary, speaker, comments = []) {
    this.title = title;
    this.summary = summary;
    this.presenter = speaker;
    this.comments = comments;
  }

  // Merges the data object into this talk
  syncState(data) {
    Object.assign(this, data);
  }
}

// Handler for GET /talks must look up the talk and return it as JSON
router.add("GET", talkPath, async (server, title) => {
  if (Object.hasOwn(server.talks, title)) {
    return {
      body: JSON.stringify(server.talks[title]),
      headers: { "Content-Type": "application/json" },
    };
  } else {
    // No such talk: return a 404
    return { status: 404, body: `No talk '${title}' found` };
  }
});

// Delete a talk by removing from the talks object
router.add("DELETE", talkPath, async (server, title) => {
  if (Object.hasOwn(server.talks, title)) {
    delete server.talks[title];
    server.updated();
  }
  return { status: 204 };
});

// Rename json as readJSON to avoid confusion. This collects the data in the stream and parses it as JSON.
import { json as readJSON } from "node:stream/consumers";
// Read the body from the request stream
router.add("PUT", talkPath, async (server, title, request) => {
  let talk = await readJSON(request);
  if (
    !talk ||
    typeof talk.presenter != "string" ||
    typeof talk.summary != "string"
  ) {
    return { status: 400, body: "Bad talk data" };
  }
  if (Object.hasOwn(server.talks, title)) {
    server.talks[title].syncState(talk);
  } else {
    server.talks[title] = new Talk(title, talk.presenter, talk.summary);
  }
  server.updated();
  return { status: 204 };
});

// Add a comment to a talk. Use readJSON to collect the data
router.add(
  "POST",
  /^\/talks\/([^\/]+)\/comments$/,
  async (server, title, request) => {
    let comment = await readJSON(request);
    if (
      !comment ||
      typeof comment.author != "string" ||
      typeof comment.message != "string"
    ) {
      // Bad comment
      return { status: 400, body: "Bad comment data" };
    } else if (Object.hasOwn(server.talks, title)) {
      // Talk exists, valid comment: add it
      server.talks[title].comments.push(comment);
      server.updated();
      return { status: 204 };
    } else {
      // No such talk
      return { status: 404, body: `No talk '${title}' found` };
    }
  }
);

// First define a helper method that builds up an array of talks to send to the client using an ETag header
SkillShareServer.prototype.talkResponse = function () {
  let talks = Object.keys(this.talks).map((title) => this.talks[title]);
  return {
    body: JSON.stringify(talks),
    headers: {
      "Content-Type": "application/json",
      ETag: `"${this.version}"`,
      "Cache-Control": "no-store",
    },
  };
};

// The GET handler needs to look at the request headers to see if the client has sent an If-None-Match or Prefer header
router.add("GET", /^\/talks$/, async (server, request) => {
  let tag = /"(.*)"/.exec(request.headers["if-none-match"]);
  let wait = /\bwait=(\d+)/.exec(request.headers["prefer"]);
  if (!tag || tag[1] != server.version) {
    // No match: return the talks
    return server.talkResponse();
  } else if (!wait) {
    // No wait: return 304 immediately
    return { status: 304 };
  } else {
    // Wait: return a promise that resolves after the specified time
    return server.waitForChanges(Number(wait[1]));
  }
});

// Callback functions for delayed responses are stored in the waiting array
SkillShareServer.prototype.waitForChanges = function (time) {
  return new Promise((resolve) => {
    this.waiting.push(resolve);
    setTimeout(() => {
      if (!this.waiting.includes(resolve)) return;
      // Respond with 304 when the request has waited for long enough
      this.waiting = this.waiting.filter((r) => r != resolve);
      resolve({ status: 304 });
    }, time * 1000);
  });
};

// Registering a change with updated increases the version property and wakes up all waiting requests
SkillShareServer.prototype.updated = async function () {
  this.version++;
  let response = this.talkResponse();
  this.waiting.forEach((resolve) => resolve(response));
  this.waiting = [];
  await saveData(this.talks);
};

// Serves files from the public directory alongside a talk-managing interface under the /talks URL
new SkillShareServer(loadData()).start(8000);
