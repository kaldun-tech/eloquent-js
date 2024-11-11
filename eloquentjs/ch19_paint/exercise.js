/*
Add keyboard shortcuts to the application. The first letter of a tool’s name selects the tool, and ctrl-Z or command-Z activates undo.

Do this by modifying the PixelEditor component. Add a tabIndex property of 0 to the wrapping <div> element so that it can receive
keyboard focus. Note that the property corresponding to the tabindex attribute is called tabIndex, with a capital I, and our elt
function expects property names. Register the key event handlers directly on that element. This means you have to click, touch,
or tab to the application before you can interact with it with the keyboard.

Remember that keyboard events have ctrlKey and metaKey (for command on Mac) properties that you can use to see whether those keys are held down.
*/
// The original PixelEditor class. Extend the constructor.
class PixelEditor {
  constructor(state, config) {
    let { tools, controls, dispatch } = config;
    this.state = state;

    this.canvas = new PictureCanvas(state.picture, (pos) => {
      let tool = tools[this.state.tool];
      let onMove = tool(pos, this.state, dispatch);
      if (onMove) {
        return (pos) => onMove(pos, this.state, dispatch);
      }
    });
    this.controls = controls.map((Control) => new Control(state, config));
    this.dom = elt(
      "div",
      {
        // tabIndex allows the wrapping div to receive keyboard focus. Then add the event handler for keyDown
        tabIndex: 0,
        onkeydown: (event) => this.keyDown(event, config),
      },
      this.canvas.dom,
      elt("br"),
      ...this.controls.reduce((a, c) => a.concat(" ", c.dom), [])
    );
  }

  keyDown(event, config) {
    if (event.key == "z" && (event.ctrlKey || event.metaKey)) {
      // Undo
      event.preventDefault();
      config.dispatch({ undo: true });
    } else if (!event.ctrlKey && !event.metaKey && !event.altKey) {
      // Look up the tool in the config tools keys
      for (let tool of Object.keys(config.tools)) {
        if (tool[0] == event.key) {
          event.preventDefault();
          config.dispatch({ tool });
          return;
        }
      }
    }
  }
  syncState(state) {
    this.state = state;
    this.canvas.syncState(state.picture);
    for (let ctrl of this.controls) ctrl.syncState(state);
  }
}

document.querySelector("div").appendChild(startPixelEditor({}));

/*
Efficient Drawing

During drawing, the majority of work that our application does happens in drawPicture. Creating a new state and
updating the rest of the DOM isn’t very expensive, but repainting all the pixels on the canvas is quite a bit of work.

Find a way to make the syncState method of PictureCanvas faster by redrawing only the pixels that actually changed.

Remember that drawPicture is also used by the save button, so if you change it, either make sure the changes don’t
break the old use or create a new version with a different name.

Also note that changing the size of a <canvas> element, by setting its width or height properties, clears it,
making it entirely transparent again.
*/
// Change this method
PictureCanvas.prototype.syncState = function (picture) {
  if (this.picture == picture) return;
  drawPicture(picture, this.dom, scale, this.picture);
  this.picture = picture;
};

function drawPicture(picture, canvas, scale, previous) {
  if (
    previous == null ||
    previous.width != picture.width ||
    previous.height != picture.height
  ) {
    // Clear the canvas
    canvas.width = picture.width * scale;
    canvas.height = picture.height * scale;
    previous = null;
  }

  let cx = canvas.getContext("2d");
  for (let y = 0; y < picture.height; y++) {
    for (let x = 0; x < picture.width; x++) {
      // Redraw only the pixels that have changed
      let color = picture.pixel(x, y);
      if (previous == null || previous.pixel(x, y) != color) {
        cx.fillStyle = color;
        cx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }
}

document.querySelector("div").appendChild(startPixelEditor({}));

/*
Define a tool called circle that draws a filled circle when you drag. The center of the circle lies at the point where the drag
or touch gesture starts, and its radius is determined by the distance dragged.
*/
function circle(pos, state, dispatch) {
  function drawCircle(to) {
    let radius = Math.sqrt((to.x - pos.x) ** 2 + (to.y - pos.y) ** 2);
    let radiusC = Math.ceil(radius);
    let drawn = [];
    for (let dy = -radiusC; dy <= radiusC; dy++) {
      for (let dx = -radiusC; dx <= radiusC; dx++) {
        let dist = Math.sqrt(dx ** 2 + dy ** 2);
        if (dist > radius) continue;
        let y = pos.y + dy,
          x = pos.x + dx;
        if (
          y < 0 ||
          y >= state.picture.height ||
          x < 0 ||
          x >= state.picture.width
        )
          continue;
        drawn.push({ x, y, color: state.color });
      }
    }
    dispatch({ picture: state.picture.draw(drawn) });
  }
  drawCircle(pos);
  return drawCircle;
}

let dom = startPixelEditor({
  tools: { ...baseTools, circle },
});
document.querySelector("div").appendChild(dom);

/*
This is a more advanced exercise than the preceding three, and it will require you to design a solution to a nontrivial problem.
Make sure you have plenty of time and patience before starting to work on this exercise, and don’t get discouraged by initial failures.

On most browsers, when you select the draw tool and quickly drag across the picture, you don’t get a closed line. Rather,
you get dots with gaps between them because the "mousemove" or "touchmove" events did not fire quickly enough to hit every pixel.

Improve the draw tool to make it draw a full line. This means you have to make the motion handler function remember the previous
position and connect that to the current one.

To do this, since the pixels can be an arbitrary distance apart, you’ll have to write a general line drawing function.

A line between two pixels is a connected chain of pixels, as straight as possible, going from the start to the end.
Diagonally adjacent pixels count as connected. A slanted line should look like the picture on the left, not the picture on the right.

Finally, if we have code that draws a line between two arbitrary points, we might as well use it to also define a line tool,
which draws a straight line between the start and end of a drag.
*/
// Rewrite the draw tool using "stroke rendering" or "gesture recognition".
function drawLine(from, to, color) {
  let points = [];
  if (Math.abs(from.y - to.y) < Math.abs(from.x - to.x)) {
    if (to.x < from.x) [from, to] = [to, from];
    let slope = (to.y - from.y) / (to.x - from.x);
    for (let { x, y } = from; x <= to.x; x++) {
      points.push({ x, y: Math.round(y), color });
      y += slope;
    }
  } else {
    if (to.y < from.y) [from, to] = [to, from];
    let slope = (to.x - from.x) / (to.y - from.y);
    for (let { x, y } = from; y <= to.y; y++) {
      points.push({ x: Math.round(x), y, color });
      x += slope;
    }
  }
  return points;
}

function draw(pos, state, dispatch) {
  function connect(newPos, state) {
    let line = drawLine(pos, newPos, state.color);
    pos = newPos;
    dispatch({ picture: state.picture.draw(line) });
  }
  connect(pos, state);
  return connect;
}

function line(pos, state, dispatch) {
  return (end) => {
    let line = drawLine(pos, end, state.color);
    dispatch({ picture: state.picture.draw(line) });
  };
}

let dom = startPixelEditor({
  tools: { draw, line, fill, rectangle, pick },
});
document.querySelector("div").appendChild(dom);
