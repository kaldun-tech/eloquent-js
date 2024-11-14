// Takes a client action and makes it happen. State updates are simple.
function handleAction(state, action) {
  if (action.type == "setUser") {
    // Store the username in local storage so it can be restored on page load
    localStorage.setItem("userName", action.user);
    return { ...state, user: action.user };
  } else if (action.type == "setTalks") {
    return { ...state, talks: action.talks };
  } else if (action.type == "newTalk") {
    fetchOK(talkURL(action.title), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        presenter: state.user,
        summary: action.summary,
      }),
    }).catch(reportError);
  } else if (action.type == "deleteTalk") {
    fetchOK(talkURL(action.talk), { method: "DELETE" }).catch(reportError);
  } else if (action.type == "newComment") {
    fetchOK(talkURL(action.talk) + "/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        author: state.user,
        message: action.message,
      }),
    }).catch(reportError);
  }
  return state;
}

// Makes sure the returned promise is rejected when the server returns an error code
function fetchOK(url, options) {
  return fetch(url, options).then((response) => {
    if (response.status < 400) return response;
    else throw new Error(response.statusText);
  });
}

// Helper builds up a URL for a talk with a given title
function talkURL(title) {
  return "talks/" + encodeURIComponent(title);
}

// Displays an error message when the request fails
function reportError(error) {
  alert(String(error));
}

// Component shows the field where the user can enter their name
function renderUserField(name, dispatch) {
  return elt(
    "label",
    {},
    "Your name: ",
    elt("input", {
      type: "text",
      value: name,
      onchange(event) {
        dispatch({ type: "setUser", user: event.target.value });
      },
    })
  );
}

// Creates an element node and treats the rest of its arguments as child nodes
function elt(type, props, ...children) {
  let dom = document.createElement(type);
  if (props) Object.assign(dom, props);
  for (let child of children) {
    if (typeof child != "string") dom.appendChild(child);
    else dom.appendChild(document.createTextNode(child));
  }
  return dom;
}

// Renders a talk including a list of comments and a form for adding new comments
function renderTalk(talk, dispatch) {
  return elt(
    "section",
    { className: "talk" },
    elt(
      "h2",
      null,
      talk.title,
      " ",
      elt(
        "button",
        {
          type: "button",
          onclick() {
            dispatch({ type: "deleteTalk", talk: talk.title });
          },
        },
        "Delete"
      )
    ),
    elt("div", null, "by ", elt("strong", null, talk.presenter)),
    elt("p", null, talk.summary),
    ...talk.comments.map(renderComment),
    elt(
      "form",
      {
        // The submit handler calls form.reset to clear the form's content after creating a newComment action
        onsubmit(event) {
          event.preventDefault();
          let form = event.target;
          dispatch({
            type: "newComment",
            talk: talk.title,
            message: form.elements.comment.value,
          });
          form.reset();
        },
      },
      elt("input", { type: "text", name: "comment" }),
      " ",
      elt("button", { type: "submit" }, "Add comment")
    )
  );
}

function renderComment(comment) {
  return elt(
    "p",
    { className: "comment" },
    elt("strong", null, comment.author),
    ": ",
    comment.message
  );
}

// Renders a form for creating new talks
function renderTalkForm(dispatch) {
  let title = elt("input", { type: "text" });
  let summary = elt("input", { type: "text" });
  return elt(
    "form",
    {
      onsubmit(event) {
        event.preventDefault();
        dispatch({
          type: "newTalk",
          title: title.value,
          summary: summary.value,
        });
        event.target.reset();
      },
    },
    elt("h3", null, "Submit a Talk"),
    elt("label", null, "Title: ", title),
    elt("label", null, "Summary: ", summary),
    elt("button", { type: "submit" }, "Submit")
  );
}

// Keep polling the server for /talks and call callback when a new set of talks is available
async function pollTalks(update) {
  let tag = undefined;
  while (true) {
    let response;
    try {
      // Wait 90 seconds before making the request
      response = await fetchOK("/talks", {
        headers: tag && { "If-None-Match": tag, Prefer: "wait=90" },
      });
    } catch (e) {
      // If the request fails, wait 500ms and try again
      console.log("Request failed: " + e);
      await new Promise((resolve) => setTimeout(resolve, 500));
      continue;
    }
    // 304 indicates a long polling request timed out so just try again
    if (response.status == 304) continue;
    // Normal 200 response: body is read as JSON and passed to the callback. ETag header is stored for next iteration.
    tag = response.headers.get("ETag");
    update(await response.json());
  }
}

// Defines a talk and builds DOM for it
class Talk {
  constructor(talk, dispatch) {
    this.comments = elt("div");
    this.dom = elt(
      "section",
      { className: "talk" },
      elt(
        "h2",
        null,
        talk.title,
        " ",
        elt(
          "button",
          {
            type: "button",
            onclick: () => dispatch({ type: "deleteTalk", talk: talk.title }),
          },
          "Delete"
        )
      ),
      elt("div", null, "by ", elt("strong", null, talk.presenter)),
      elt("p", null, talk.summary),
      this.comments,
      elt(
        "form",
        {
          onsubmit(event) {
            event.preventDefault();
            let form = event.target;
            dispatch({
              type: "newComment",
              talk: talk.title,
              message: form.elements.comment.value,
            });
            form.reset();
          },
        },
        elt("input", { type: "text", name: "comment" }),
        " ",
        elt("button", { type: "submit" }, "Add comment")
      )
    );
    this.syncState(talk);
  }

  syncState(talk) {
    this.talk = talk;
    this.comments.textContent = "";
    for (let comment of talk.comments) {
      this.comments.appendChild(renderComment(comment));
    }
  }
}

// The main application component ties the UI together
var SkillShareApp = class SkillShareApp {
  constructor(state, dispatch) {
    this.dispatch = dispatch;
    this.talkDOM = elt("div", { className: "talks" });
    this.talkMap = Object.create(null);
    this.dom = elt(
      "div",
      null,
      renderUserField(state.user, dispatch),
      this.talkDOM,
      renderTalkForm(dispatch)
    );
    this.syncState(state);
  }

  syncState(state) {
    if (state.talks == this.talks) return;
    this.talks = state.talks;

    for (let talk of state.talks) {
      // Look up the talk in the map
      let found = this.talkMap[talk.title];
      if (
        found &&
        found.talk.presenter == talk.presenter &&
        found.talk.summary == talk.summary
      ) {
        // Update existing talk
        found.syncState(talk);
      } else {
        // Recreate talk with new presenter and summary
        if (found) found.dom.remove();
        found = new Talk(talk, this.dispatch);
        this.talkMap[talk.title] = found;
        this.talkDOM.appendChild(found.dom);
      }
    }
    for (let title of Object.keys(this.talkMap)) {
      // Remove talks that no longer exist
      if (!state.talks.some((talk) => talk.title == title)) {
        this.talkMap[title].dom.remove();
        delete this.talkMap[title];
      }
    }
  }
};

function runApp() {
  let user = localStorage.getItem("userName") || "Anon";
  let state, app;
  function dispatch(action) {
    state = handleAction(state, action);
    app.syncState(state);
  }

  pollTalks((talks) => {
    if (!app) {
      state = { user, talks };
      app = new SkillShareApp(state, dispatch);
      document.body.appendChild(app.dom);
    } else {
      dispatch({ type: "setTalks", talks });
    }
  }).catch(reportError);
}

runApp();
