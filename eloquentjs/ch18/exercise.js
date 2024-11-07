/*
One of the things HTTP can do is called content negotiation. The Accept request header is used to tell the server what
type of document the client would like to get. Many servers ignore this header, but when a server knows of various ways
to encode a resource, it can look at this header and send the one that the client prefers.

The URL https://eloquentjavascript.net/author is configured to respond with either plaintext, HTML, or JSON, depending
on what the client asks for. These formats are identified by the standardized media types text/plain, text/html, and application/json.

Send requests to fetch all three formats of this resource. Use the headers property in the options object passed to
fetch to set the header named Accept to the desired media type.

Finally, try asking for the media type application/rainbows+unicorns and see which status code that produces.
*/
function negotiate(mediaType) {
  fetch("https://eloquentjavascript.net/author", {
    headers: { Accept: mediaType },
  })
    .then((resp) => resp.text())
    .then(console.log);
}

negotiate("text/plain");
negotiate("text/html");
negotiate("application/json");
negotiate("application/rainbows+unicorns");

/*
Build an interface that allows users to type and run pieces of JavaScript code.

Put a button next to a <textarea> field that, when pressed, uses the Function constructor we saw in Chapter 10
to wrap the text in a function and call it. Convert the return value of the function, or any error it raises,
to a string and display it below the text field.
*/
function callWrappedText() {
  let codeTextArea = document.getElementById("code");
  let outputPre = document.getElementById("output");
  let codeText = codeTextArea.value;
  let outputText = "";

  try {
    var builtFunction = new Function(codeText);
    // Alernative option: eval(codeText);
    outputText = builtFunction();
  } catch (err) {
    outputText = "Error: " + err;
  }
  outputPre.textContent = outputText + "\n";
}
let button = document.getElementById("button");
button.addEventListener("click", () => callWrappedText());

/*
Conway’s Game of Life is a simple simulation that creates artificial “life” on a grid, each cell of which is
either alive or not. In each generation (turn), the following rules are applied:
- Any live cell with fewer than two or more than three live neighbors dies.
- Any live cell with two or three live neighbors lives on to the next generation.
- Any dead cell with exactly three live neighbors becomes a live cell.
- A neighbor is defined as any adjacent cell, including diagonally adjacent ones.

Note that these rules are applied to the whole grid at once, not one square at a time.
That means the counting of neighbors is based on the situation at the start of the generation,
and changes happening to neighbor cells during this generation should not influence the new state of a given cell.

Implement this game using whichever data structure you find appropriate. Use Math.random to populate the
grid with a random pattern initially. Display it as a grid of checkbox fields, with a button next to it to
advance to the next generation. When the user checks or unchecks the checkboxes, their changes should be included
when computing the next generation.
*/
class Cell {
  // A cell is alive or dead and references a div element
  constructor(alive, divElem) {
    this.isAlive = alive;
    this.divElem = divElem;
  }
  kill() {
    this.isAlive = false;
  }
  birth() {
    this.isAlive = true;
  }
}

// This is set up to have both a grid of cells
class Grid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.cells = new Cell[rows][cols]();
    this.buildGrid();
  }

  setElemBackground(cellElem, alive) {
    cellElem.style.background = alive ? "white" : "black";
  }

  buildGrid() {
    let gridElement = document.getElementById("grid");
    for (let i = 0; i < this.rows; ++i) {
      for (let j = 0; j < this.cols; ++j) {
        // Create cell
        const cellElem = document.createElement("div");
        cellElem.style.width = cellElem.style.height = "20px";
        // Randomize alive or dead state
        let alive = Math.random() < 0.5;
        setElemBackground(cellElem, alive);
        // Add to cells
        this.cells[i][j] = new Cell(alive, cellElem);
        gridElement.appendChild(cellElem);
      }
    }
  }

  updateGrid() {
    let gridElement = document.getElementById("grid");
    for (let i = 0; i < this.rows * this.cols; ++i) {
      let row = i / this.rows;
      let col = i % this.cols;
      let cellElem = gridElement.children[i];
      let alive = this.grid[row][col].isAlive;
      this.setElemBackground(cellElem, alive);
    }
  }

  findNeighbors(row, col) {
    if (row < 0 || col < 0 || this.rows <= row || this.cols <= col) {
      console.log("Index out of bounds");
      return;
    }
    let neighbors = [];
    if (0 < row) {
      // Row above
      neighbors.push(this.cells[row - 1], col);
      if (0 < col) {
        // Top left
        neighbors.push(this.cells[row - 1][col - 1]);
      }
      if (col + 1 < this.cols) {
        // Top right
        neighbors.push(this.cells[row - 1][col + 1]);
      }
    }
    if (0 < col) {
      // Column left
      neighbors.push(this.cells[row][col - 1]);
    }
    if (col + 1 < this.cols) {
      // Column right
      neighbors.push(this.cells[row][col + 1]);
    }
    if (row + 1 < this.rows) {
      // Row below
      neighbors.push(this.cells[row + 1], col);
      if (0 < col) {
        // Bottom left
        neighbors.push(this.cells[row + 1][col - 1]);
      }
      if (col + 1 < this.cols) {
        // Bottom right
        neighbors.push(this.cells[row + 1][col + 1]);
      }
    }
    return neighbors;
  }

  applyRules(row, col) {
    // Compute the number of neighbors alive
    let cell = this.cells[row][col];
    const neighbors = this.findNeighbors(row, col);
    const aliveNeighbors = neighbors.filter((cell) => cell.isAlive).length;
    // Live cells die with fewer than 2 or more than 3 neighbors
    if (cell.isAlive && (aliveNeighbors < 2 || 3 < aliveNeighbors)) {
      cell.kill();
    } else if (!cell.isAlive && aliveNeighbors == 3) {
      // Dead cells with exactly three neighbors are born
      cell.birth();
    } // Live cells with 2 or 3 neighbors stay alive. Dead cells stay dead.
  }

  runTurn() {
    for (let i = 0; i < this.rows; ++i) {
      for (let j = 0; j < this.cols; ++j) {
        this.applyRules(row, col);
      }
    }
    this.updateGrid();
  }
}
let grid = new Grid(10, 10);
let nextButton = document.getElementById("next");
nextButton.addEventListener("click", () => grid.runTurn());
